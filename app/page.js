'use client';
import { useState } from 'react';
import axios from 'axios';

export default function Home() {
  const [url, setUrl] = useState('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
  const [type, setType] = useState('normal'); // audio-only, video-only, normal
  const [format, setFormat] = useState('best');
  const [data, setData] = useState(null); // [{format, url}
  const [search, setSearch] = useState(false); // [{format, url}
  const [error, setError] = useState(false); //

  const handleGetInfo = async (event) => {
    event.preventDefault();
    try {
      setData(null);
      const {
        data: { formats },
      } = await axios.get(
        `http://localhost:3002/api/v1/getinfo?url=${encodeURIComponent(
          url
        )}&type=${type}`
      );
      const preferredFormats = formats.filter(
        ({ bitrate, audioBitrate }) => bitrate && audioBitrate
      );
      setData(formats);
    } catch (error) {
      console.error('Something went wrong:', error);
      setError(true);
    }
  };

  const handleDownload = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.get(
        `http://localhost:3002/api/v1/download?url=${encodeURIComponent(
          url
        )}&quality=${event.target.download.value}`,
        {
          responseType: 'blob',
        }
      );
      saveFile(response.data);
    } catch (error) {
      console.error('Something went wrong:', error);
      setError(true);
    }
  };

  const saveFile = (blob) => {
    const link = document.createElement('a');
    link.download = 'audio.mp4';
    link.href = URL.createObjectURL(new Blob([blob]));
    link.addEventListener('click', (e) => {
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
      }, 100);
    });
    link.click();
  };

  const downloadPrompt = (data) => {
    if (!data) return <Busy />;

    return (
      <div>
        <form onSubmit={handleDownload}>
          <h1 className='text-3xl font-bold underline mb-5'>Download</h1>
          {data.map((item, index) => (
            <div className='mb-3' key={index}>
              <input type='radio' name='download' value={item.itag} />
              <p>Quality: {item.qualityLabel}</p>
              <p>Format: {item.codecs}</p>
            </div>
          ))}
          <button
            type='submit'
            className='outline outline-1 outline-white rounded-md p-2'
          >
            Download
          </button>
        </form>
      </div>
    );
  };

  const Busy = () => {
    return (
      <div>
        <h1 className='text-3xl font-bold underline mb-3'>Loading...</h1>
        <svg
          xmlns='http://www.w3.org/2000/svg'
          viewBox='0 0 48 48'
          width='48'
          height='48'
        >
          <circle
            cx='24'
            cy='24'
            r='20'
            stroke='#000'
            strokeWidth='3'
            fill='none'
          />
          <circle cx='24' cy='24' r='12' fill='#fff' />
        </svg>
      </div>
    );
  };

  const Error = () => {
    return (
      <div>
        <h1 className='text-3xl font-bold underline mb-3'>Error</h1>
        <p>Something went wrong</p>
      </div>
    );
  };

  return (
    <div className='p-3'>
      <form onSubmit={handleGetInfo}>
        <h1 className='text-3xl font-bold underline mb-3'>
          Youtube Downloader
        </h1>
        <label className='mr-2'>
          YouTube URL:
          <input
            type='text'
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className='text-black ml-2'
          />
        </label>
        <label className='mr-2'>
          Video format:
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className='text-black ml-2'
          >
            <option value='best'>Best quality</option>
            <option value='worst'>Worst quality</option>
          </select>
        </label>
        <label className='mr-2'>
          Download Type:
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className='text-black ml-2'
          >
            <option value='normal'>Normal</option>
            <option value='audio-only'>Audio Only</option>
            <option value='video-only'>Video Only</option>
          </select>
        </label>
        <button
          type='submit'
          className='outline outline-1 outline-white rounded-md p-2'
        >
          Get Info
        </button>
      </form>
      {downloadPrompt(data)}
      {error && <Error />}
    </div>
  );
}
