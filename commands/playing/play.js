import cmd from "../../library/map.js";
import {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  StreamType,
} from "@discordjs/voice";
import fetch from "node-fetch";
import { Readable, PassThrough } from "stream";
import ffmpeg from "fluent-ffmpeg";

async function toVN(inputBuffer) {
  return new Promise((resolve, reject) => {
    const inStream = new PassThrough();
    const outStream = new PassThrough();
    const chunks = [];

    inStream.end(inputBuffer);

    ffmpeg(inStream)
      .noVideo()
      .audioCodec("libopus")
      .format("ogg")
      .audioBitrate("48k")
      .audioChannels(1)
      .audioFrequency(48000)
      .outputOptions([
        "-map_metadata", "-1",
        "-application", "voip",
        "-compression_level", "10",
        "-page_duration", "20000",
      ])
      .on("error", reject)
      .on("end", () => resolve(Buffer.concat(chunks)))
      .pipe(outStream, { end: true });

    outStream.on("data", (c) => chunks.push(c));
  });
}

async function generateWaveform(inputBuffer, bars = 64) {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(inputBuffer);

    const chunks = [];

    ffmpeg(inputStream)
      .audioChannels(1)
      .audioFrequency(16000)
      .format("s16le")
      .on("error", reject)
      .on("end", () => {
        const rawData = Buffer.concat(chunks);
        const samples = rawData.length / 2;

        const amplitudes = [];
        for (let i = 0; i < samples; i++) {
          let val = rawData.readInt16LE(i * 2);
          amplitudes.push(Math.abs(val) / 32768);
        }

        let blockSize = Math.floor(amplitudes.length / bars);
        let avg = [];
        for (let i = 0; i < bars; i++) {
          let block = amplitudes.slice(i * blockSize, (i + 1) * blockSize);
          avg.push(block.reduce((a, b) => a + b, 0) / block.length);
        }

        let max = Math.max(...avg);
        let normalized = avg.map(v => Math.floor((v / max) * 100));

        let buf = Buffer.from(new Uint8Array(normalized));
        resolve(buf.toString("base64"));
      })
      .pipe()
      .on("data", (chunk) => chunks.push(chunk));
  });
}

cmd.add({
  name: "play",
  alias: ["p"],
  desc: "Putar lagu dari YouTube menggunakan API OotaIzumi",
  category: "music",
  run: async ({ message, client, args }) => {
    const query = args.join(" ");
    if (!query)
      return message.reply("⚠️ Masukkan judul lagu atau URL YouTube!");

    const voiceChannel = message.member?.voice.channel;
    if (!voiceChannel)
      return message.reply("❌ Kamu harus join voice channel dulu!");

    try {
      const res = await fetch(
        apikey.izumi + `/downloader/youtube-play?query=${encodeURIComponent(query)}`
      );
      const data = await res.json();
      const r = data.result;

      if (!data.status || !r?.download)
        return message.reply("❌ Lagu tidak ditemukan!");

      const embed = {
        title: r.title || "Tanpa Judul",
        url: r.url,
        thumbnail: { url: r.thumbnail },
        description:
          (r.description?.slice(0, 300) || "Tidak ada deskripsi") +
          (r.description?.length > 300 ? "..." : ""),
        fields: [
          { name: "Durasi", value: r.metadata?.duration || "Unknown", inline: true },
          { name: "Views / Likes", value: `${r.metadata?.view || "?"} • ${r.metadata?.like || "?"}`, inline: true },
          { name: "Channel", value: `[${r.author?.channelTitle}](${r.author?.channelLink})` || "Unknown", inline: false },
        ],
        footer: { text: `Source: ${data.creator || "OotaIzumi API"}` },
        color: 0x5865f2,
      };
      await message.channel.send({ embeds: [embed] });

      const audioRes = await fetch(r.download);
      const audioBuffer = Buffer.from(await audioRes.arrayBuffer());

      const converted = await toVN(audioBuffer);
      const waveform = await generateWaveform(audioBuffer);

      await message.channel.send(`📊 Waveform Base64: \`${waveform.slice(0, 60)}...\``);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
      });

      const stream = Readable.from(converted);
      const resource = createAudioResource(stream, { inputType: StreamType.Arbitrary });

      const player = createAudioPlayer();
      player.play(resource);
      connection.subscribe(player);

      player.on(AudioPlayerStatus.Playing, () => {
        message.channel.send(`🎶 Sedang memutar: **${r.title}**`);
      });

      player.on(AudioPlayerStatus.Idle, () => {
        connection.destroy();
        message.channel.send("✅ Lagu selesai diputar!");
      });

      player.on("error", (err) => {
        console.error("Player Error:", err);
        message.channel.send("⚠️ Gagal memainkan audio: " + err.message);
      });

    } catch (err) {
      console.error(err);
      message.reply("❌ Terjadi kesalahan saat memutar lagu.");
    }
  },
});