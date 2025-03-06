
let scannerClick = document.getElementById("scanner_click");

// Add click event listener to the scanner button
scannerClick.addEventListener("click", function () {

let maindiv =document.getElementById("main")
  const video = document.getElementById("video");
  video.style.display = "block"; // Ensure the video element is visible
  
  // Hide overflow of the scanner button if necessary
maindiv.style.display="none"

  // Initialize the QR code reader
  const codeReader = new ZXing.BrowserQRCodeReader();

  // Start scanning from the camera
  codeReader
    .decodeFromInputVideoDevice(undefined, "video")
    .then((result) => {
      console.log(result);
      alert("QR Code: " + result.text); // Show QR code result
      video.style.display = "none"; // Hide the video element after scan
      maindiv.style.display = "block";
    })
    .catch((err) => {
      console.error(err);
      alert("Error: " + err); // Display error for debugging
    });

  // Ensure the video plays (this might not work due to autoplay restrictions)
  video.play().catch((error) => {
    console.error("Video play failed:", error); // Log error if autoplay fails
    


  });

});
let maindiv = document.getElementById("main");
let buttonClose = document.getElementById("close-button");
      buttonClose.addEventListener("click", function () {
       maindiv.style.display = "block";
        console.log("close");
      });