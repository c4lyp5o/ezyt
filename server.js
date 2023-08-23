const fastify = require('fastify')({
  logger: false,
});
const cors = require('@fastify/cors');
const fs = require('fs');
const ytdl = require('ytdl-core');
const plogger = require('progress-estimator')();

fastify.register(cors, {
  origin: '*',
});

fastify.get('/', async (request, reply) => {
  reply.status(200).send('Hello World!');
});

fastify.get('/api/v1/getinfo', async (request, reply) => {
  const { url, type } = request.query;
  let data;
  const query = ytdl.getInfo(url);
  const info = await plogger(query, 'Obtaining format...');
  switch (type) {
    case 'audio-only':
      data = ytdl.filterFormats(info.formats, 'audioonly');
      console.log('Formats with only audio: ' + data.length);
      break;
    case 'video-only':
      data = ytdl.filterFormats(info.formats, 'videoonly');
      console.log('Formats with only video: ' + data.length);
      break;
    default:
      data = info.formats;
      console.log('All formats: ' + data.length);
      break;
  }
  reply.status(200).send({ formats: data });
});

fastify.get('/api/v1/download', async (request, reply) => {
  const { url, quality } = request.query;
  const query = await ytdl.getInfo(url);

  // write
  const writeStream = ytdl.downloadFromInfo(query, {
    quality: quality,
  });
  writeStream.pipe(fs.createWriteStream('audio.mp4'));
  writeStream.on('progress', (chunkLength, downloaded, total) => {
    const percent = (downloaded / total) * 100;
    console.log(
      `Downloaded ${percent.toFixed(
        2
      )}% | ${downloaded} bytes out of ${total} bytes.`
    );
  });
  writeStream.on('end', () => {
    console.log('Download finished!');
  });
  // read
  const readStream = fs.readFileSync('audio.mp4');
  reply.send(readStream);
});

fastify.listen({ port: 3002 }, function (err, address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
  console.log(`Server is now listening on ${address}`);
});
