import { useState } from "react";
import "./App.css";

// A Function to fetch the details from UI and submit them to the backend
// Returns frontend form code
function FileUpload() {
  // Variable Initialization
  const [name, setName] = useState(null);
  const [number, setNumber] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [filesUploaded, setFilesUploaded] = useState(null);
  const [success, setSuccess] = useState(false);

  // Handling change in the text boxes and fetching them
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    console.log(selectedFiles);
  };
  const handleNameChange = (event) => {
    setName(event.target.value);
  };
  const handleNumberChange = (event) => {
    setNumber(event.target.value);
  };

  // Handling the upload of files in a FormData object
  const handleUpload = async (e) => {
    e.preventDefault();

    // Create a FormData object
    const formData = new FormData();

    // Append each selected file to the FormData object
    selectedFiles.forEach((file) => {
      formData.append("files", file);
    });

    // Calling /uploadfiles for IPFS Action
    try {
      const resp = await fetch("http://localhost:4000/uploadfiles", {
        method: "POST",
        body: formData,
      });
      setFilesUploaded(await resp.json());
      console.log(filesUploaded);

      // Calling /addtoHF&SQL for HF and SQL Action
      const res = await fetch("http://localhost:4000/addToHF&SQL", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name, pNum: number }),
      });
      if (res.ok) {
        setSuccess(true);
      }
    } catch (error) {
      console.log("Oops!! something went wrong");
      console.log(error);
    }
  };

  return (
    <>
      <form>
        <div className="header">IPFS & SQL DEMONSTRATION</div>
        <br />
        <br />
        <label>Enter Name:</label>
        <input type="text" onChange={handleNameChange}></input>
        <br /><br/>
        <label>Enter PAN Number:</label>
        <input type="text" onChange={handleNumberChange}></input>
        <br /><br/>
        <label>Add file:</label>
        <input
          type="file"
          multiple
          accept=".jpg,.jpeg,.png"
          onChange={handleFileChange}
        ></input><br/>
        <div>
          {selectedFiles?.length > 1 &&
            selectedFiles.map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
        </div>
        <br />
        <button onClick={handleUpload}>Upload</button>
        <br />
        <br />
      </form>
      {success && alert("Completed successfully")}
    </>
  );
}

export default FileUpload;
