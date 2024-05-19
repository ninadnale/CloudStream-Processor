import logo from './logo.svg';
import './App.css';
import { useRef, useState } from 'react';
import AWS from 'aws-sdk';
import { nanoid } from 'nanoid'
// import config from './config';

function App() {
  const inputTextRef = useRef(null);
  const [file, setFile] = useState(null);
  function handleFileUpload(e) {
    const f = e.target.files[0];
    console.log(f, inputTextRef.current.value);
    setFile(f);
  }
  
 const upload = async () => {
  AWS.config.update({
    accessKeyId: process.env.REACT_APP_accessKeyId,
    secretAccessKey: process.env.REACT_APP_secretAccessKey,
  });

  const S3_BUCKET = "file-upload-aws-s3-bucket";
  const REGION = "us-west-1";

  const s3 = new AWS.S3({
    params: { Bucket: S3_BUCKET },
    region: REGION,
  });

  const params = {
    Bucket: S3_BUCKET,
    Key: file.name,
    Body: file,
  };

  let up = s3
    .putObject(params)
    .on("httpUploadProgress", (e) => {
      console.log(
        "Uploading..." + parseInt((e.loaded * 100) / e.total) + "%"
      );
    })
    .promise();

  await up.then((err, data) => {
    console.log(err);
    alert("File uploaded.");
  });


  const input_file = S3_BUCKET + '/' + file.name;
  const payload = {
    id: nanoid(),
    input_text : inputTextRef.current.value,
    input_file_path : input_file,
  }

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  };

  console.log(payload);
  await fetch('https://5qkc40yqj5.execute-api.us-west-1.amazonaws.com/prod/', options)
  .then(response => response.json())
  .then(data => console.log(data))
  .catch(error => console.error(error));

};


  return (
    <div className="App overflow-hidden">
      <section class="bg-black dark:bg-gray-900">
          <div class="py-8 px-4 mx-auto max-w-screen-xl text-center lg:py-16">
              <h1 class="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl dark:text-white">Upload a File to S3</h1>
          </div>
      </section>

      <div className='grid grid-cols-2 gap-5 h-screen translate-y-20 -translate-x-16'>
          <label for="first_name" className="col-span-1 justify-self-end -translate-x-6 mt-2 text-sm font-medium text-gray-900 dark:text-white">Text Input</label>
          <input type="text" id="first_name" ref={inputTextRef} className="col-span-1 sm:w-1/2 h-10 justify-self-start bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Enter file name" required />
          
          <label class="col-span-1 justify-self-end -mt-[340px] -translate-x-6 text-sm font-medium text-gray-900 dark:text-white" for="file_input">Upload file</label>
          <input onChange={handleFileUpload} class="col-span-1 justify-self-start -mt-[350px] h-10 sm:w-1/2 w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 dark:text-gray-400 focus:outline-none dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400" id="file_input" type="file"/>
      </div>
      <button type="button" onClick={upload} class="col-span-1 col-start-2 sm:w-1/4 -translate-y-[550px] sm:translate-x-10 h-10 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800">Upload File</button>

    </div>
  );
}

export default App;
