/* =========================================================
   A W A A Z  S O S
   Voice Activated Emergency Assistance
   ========================================================= */


/* =========================================================
   CONFIGURATION
   ========================================================= */

const CONFIG = {

    EMAILJS: {

        PUBLIC_KEY: "ApUocJsnaaHnKXMx1",

        SERVICE_ID: "service_g64f11u",

        TEMPLATE_ID: "template_usj8jyu"

    },

    IMGBB: {

        API_KEY: "30744281847dbd27c199bbb451cbcebf"

    },

    TRIGGER_PHRASE: "help me"

};



/* =========================================================
   DEBUG
   ========================================================= */

console.log(
    "Awaaz SOS JavaScript loaded successfully."
);



/* =========================================================
   DOM ELEMENTS
   ========================================================= */

const setupScreen =
    document.getElementById("setupScreen");

const permissionScreen =
    document.getElementById("permissionScreen");

const listeningScreen =
    document.getElementById("listeningScreen");

const sosScreen =
    document.getElementById("sosScreen");


const userNameInput =
    document.getElementById("userName");

const emergencyEmailInput =
    document.getElementById("emergencyEmail");


const continueButton =
    document.getElementById("continueButton");

const activateButton =
    document.getElementById("activateButton");

const stopButton =
    document.getElementById("stopButton");


const systemStatus =
    document.getElementById("systemStatus");


const micPermission =
    document.getElementById("micPermission");

const locationPermission =
    document.getElementById("locationPermission");

const cameraPermission =
    document.getElementById("cameraPermission");


const permissionMessage =
    document.getElementById("permissionMessage");


const speechStatus =
    document.getElementById("speechStatus");


const displayContact =
    document.getElementById("displayContact");

const displayLocation =
    document.getElementById("displayLocation");

const displayCamera =
    document.getElementById("displayCamera");


const sosMessage =
    document.getElementById("sosMessage");

const sosLocation =
    document.getElementById("sosLocation");

const sosPhoto =
    document.getElementById("sosPhoto");

const sosEmail =
    document.getElementById("sosEmail");

const progressBar =
    document.getElementById("progressBar");


const cameraVideo =
    document.getElementById("cameraVideo");

const cameraCanvas =
    document.getElementById("cameraCanvas");


const toast =
    document.getElementById("toast");

const toastText =
    document.getElementById("toastText");



/* =========================================================
   STATE
   ========================================================= */

let userName = "";

let emergencyEmail = "";

let currentLocation = null;

let cameraStream = null;

let recognition = null;

let isListening = false;

let emergencyTriggered = false;



/* =========================================================
   INITIALIZE EMAILJS
   ========================================================= */

if (typeof emailjs !== "undefined") {

    emailjs.init({

        publicKey:
            CONFIG.EMAILJS.PUBLIC_KEY

    });

    console.log(
        "EmailJS initialized."
    );

} else {

    console.error(
        "EmailJS SDK was not loaded."
    );

}



/* =========================================================
   CONTINUE BUTTON
   ========================================================= */

continueButton.addEventListener(
    "click",
    handleContinue
);



function handleContinue() {

    userName =
        userNameInput.value.trim();

    emergencyEmail =
        emergencyEmailInput.value.trim();


    /* -----------------------------------------
       Validate name
    ----------------------------------------- */

    if (!userName) {

        showToast(
            "Please enter your name."
        );

        userNameInput.focus();

        return;

    }


    /* -----------------------------------------
       Validate email
    ----------------------------------------- */

    if (!isValidEmail(emergencyEmail)) {

        showToast(
            "Please enter a valid emergency email."
        );

        emergencyEmailInput.focus();

        return;

    }


    displayContact.textContent =
        emergencyEmail;


    setupScreen.classList.add(
        "hidden"
    );


    permissionScreen.classList.remove(
        "hidden"
    );


    systemStatus.innerHTML =
        '<span class="status-dot"></span> Permission Required';


    console.log(
        "User setup completed."
    );

}



/* =========================================================
   ACTIVATE BUTTON
   ========================================================= */

activateButton.addEventListener(
    "click",
    requestAllPermissions
);



async function requestAllPermissions() {

    activateButton.disabled = true;


    activateButton.innerHTML =
        '<i class="fa-solid fa-spinner fa-spin"></i> Requesting permissions...';


    try {

        /* =========================================
           MICROPHONE
        ========================================= */

        console.log(
            "Requesting microphone permission..."
        );


        const microphoneStream =
            await navigator.mediaDevices.getUserMedia({

                audio: true

            });


        micPermission.classList.add(
            "granted"
        );


        microphoneStream
            .getTracks()
            .forEach(
                track => track.stop()
            );


        console.log(
            "Microphone permission granted."
        );



        /* =========================================
           CAMERA
        ========================================= */

        console.log(
            "Requesting camera permission..."
        );


        cameraStream =
            await navigator.mediaDevices.getUserMedia({

                video: {

                    facingMode: "user",

                    width: {
                        ideal: 1280
                    },

                    height: {
                        ideal: 720
                    }

                }

            });


        cameraPermission.classList.add(
            "granted"
        );


        cameraVideo.srcObject =
            cameraStream;


        await cameraVideo.play();


        console.log(
            "Camera permission granted."
        );



        /* =========================================
           LOCATION
        ========================================= */

        console.log(
            "Requesting location..."
        );


        await requestLocationPermission();


        locationPermission.classList.add(
            "granted"
        );


        console.log(
            "Location permission granted."
        );



        /* =========================================
           EVERYTHING READY
        ========================================= */

        permissionMessage.textContent =
            "All permissions granted. Awaaz is ready.";


        showToast(
            "Awaaz SOS is ready."
        );


        setTimeout(
            startMonitoring,
            700
        );



    } catch (error) {

        console.error(
            "Permission error:",
            error
        );


        permissionMessage.textContent =
            "Please allow microphone, camera and location access, then try again.";


        showToast(
            "Permission required."
        );


        activateButton.disabled = false;


        activateButton.innerHTML =
            '<i class="fa-solid fa-shield-heart"></i> Allow & Activate Awaaz';

    }

}



/* =========================================================
   LOCATION
   ========================================================= */

function requestLocationPermission() {

    return new Promise(
        (resolve, reject) => {

            if (!navigator.geolocation) {

                reject(
                    new Error(
                        "Geolocation is not supported by this browser."
                    )
                );

                return;

            }


            navigator.geolocation.getCurrentPosition(

                position => {

                    currentLocation = {

                        latitude:
                            position.coords.latitude,

                        longitude:
                            position.coords.longitude,

                        accuracy:
                            position.coords.accuracy

                    };


                    console.log(
                        "Location captured:",
                        currentLocation
                    );


                    resolve(
                        currentLocation
                    );

                },


                error => {

                    console.error(
                        "Location error:",
                        error
                    );


                    reject(error);

                },


                {

                    enableHighAccuracy: true,

                    timeout: 15000,

                    maximumAge: 0

                }

            );

        }
    );

}



/* =========================================================
   START MONITORING
   ========================================================= */

function startMonitoring() {

    permissionScreen.classList.add(
        "hidden"
    );


    listeningScreen.classList.remove(
        "hidden"
    );


    systemStatus.innerHTML =
        '<span class="status-dot"></span> Listening';


    const statusDot =
        systemStatus.querySelector(
            ".status-dot"
        );


    if (statusDot) {

        statusDot.style.background =
            "#43e69a";

        statusDot.style.boxShadow =
            "0 0 10px #43e69a";

    }


    displayLocation.textContent =
        "Ready";


    displayCamera.textContent =
        "Ready";


    console.log(
        "Starting voice recognition..."
    );


    startSpeechRecognition();

}



/* =========================================================
   SPEECH RECOGNITION
   ========================================================= */

function startSpeechRecognition() {

    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


    if (!SpeechRecognition) {

        speechStatus.textContent =
            "Voice recognition is not supported in this browser.";


        showToast(
            "Use Google Chrome for voice recognition."
        );


        console.error(
            "SpeechRecognition API unavailable."
        );


        return;

    }


    recognition =
        new SpeechRecognition();


    recognition.continuous = true;

    recognition.interimResults = true;

    recognition.lang = "en-IN";



    recognition.onstart = () => {

        isListening = true;


        speechStatus.textContent =
            'Listening for "Help me"...';


        console.log(
            "Voice recognition started."
        );

    };



    recognition.onresult =
        event => {

            let transcript = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                transcript +=
                    event.results[i][0].transcript;

            }


            transcript =
                transcript
                    .toLowerCase()
                    .trim();


            console.log(
                "Awaaz heard:",
                transcript
            );


            speechStatus.textContent =
                `Heard: "${transcript}"`;


            if (
                transcript.includes(
                    CONFIG.TRIGGER_PHRASE
                )
            ) {

                console.log(
                    "🚨 TRIGGER PHRASE DETECTED"
                );


                triggerEmergency();

            }

        };



    recognition.onerror =
        event => {

            console.error(
                "Speech recognition error:",
                event.error
            );


            if (
                event.error ===
                "no-speech"
            ) {

                speechStatus.textContent =
                    'Listening for "Help me"...';

                return;

            }


            if (
                event.error ===
                "not-allowed"
            ) {

                speechStatus.textContent =
                    "Microphone permission denied.";

                showToast(
                    "Microphone permission denied."
                );

                return;

            }


            speechStatus.textContent =
                `Voice recognition error: ${event.error}`;

        };



    recognition.onend = () => {

        isListening = false;


        console.log(
            "Voice recognition ended."
        );


        /*
         * Restart automatically.
         */

        if (
            !emergencyTriggered
        ) {

            setTimeout(
                restartRecognition,
                700
            );

        }

    };


    try {

        recognition.start();

    } catch (error) {

        console.error(
            "Recognition start error:",
            error
        );

    }

}



/* =========================================================
   RESTART RECOGNITION
   ========================================================= */

function restartRecognition() {

    if (
        emergencyTriggered ||
        !recognition
    ) {

        return;

    }


    try {

        recognition.start();


        console.log(
            "Voice recognition restarted."
        );

    } catch (error) {

        console.log(
            "Recognition restart skipped:",
            error.message
        );

    }

}



/* =========================================================
   STOP MONITORING
   ========================================================= */

stopButton.addEventListener(
    "click",
    stopMonitoring
);



function stopMonitoring() {

    console.log(
        "Stopping Awaaz monitoring."
    );


    emergencyTriggered = true;


    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(error);

        }

    }


    stopCamera();


    listeningScreen.classList.add(
        "hidden"
    );


    setupScreen.classList.remove(
        "hidden"
    );


    systemStatus.innerHTML =
        '<span class="status-dot"></span> System Ready';


    const statusDot =
        systemStatus.querySelector(
            ".status-dot"
        );


    if (statusDot) {

        statusDot.style.background =
            "#777";

        statusDot.style.boxShadow =
            "none";

    }


    emergencyTriggered = false;

}



/* =========================================================
   EMERGENCY TRIGGER
   ========================================================= */

async function triggerEmergency() {

    if (emergencyTriggered) {

        return;

    }


    emergencyTriggered = true;


    console.log(
        "================================="
    );


    console.log(
        "🚨 A W A A Z  S O S  A C T I V A T E D"
    );


    console.log(
        "================================="
    );



    /* -----------------------------------------
       Stop voice recognition
    ----------------------------------------- */

    if (recognition) {

        try {

            recognition.stop();

        } catch (error) {

            console.log(error);

        }

    }



    /* -----------------------------------------
       Show SOS screen
    ----------------------------------------- */

    listeningScreen.classList.add(
        "hidden"
    );


    sosScreen.classList.remove(
        "hidden"
    );


    systemStatus.innerHTML =
        '<span class="status-dot"></span> SOS ACTIVE';


    const statusDot =
        systemStatus.querySelector(
            ".status-dot"
        );


    if (statusDot) {

        statusDot.style.background =
            "#ff4d5a";

        statusDot.style.boxShadow =
            "0 0 15px #ff4d5a";

    }


    sosMessage.textContent =
        "Emergency phrase detected. Collecting information...";


    updateProgress(5);



    /* =========================================
       GET FRESH LOCATION
    ========================================= */

    console.log(
        "Getting fresh emergency location..."
    );


    try {

        await requestLocationPermission();


        sosLocation.textContent =
            "Captured";


        displayLocation.textContent =
            "Captured";


        console.log(
            "Emergency location captured."
        );


    } catch (error) {

        console.error(
            "Emergency location error:",
            error
        );


        sosLocation.textContent =
            "Unavailable";

    }


    updateProgress(30);



    /* =========================================
       CAPTURE CAMERA IMAGE
    ========================================= */

    let imageBlob = null;


    console.log(
        "Capturing emergency image..."
    );


    try {

        /*
         * Give the camera a tiny amount of time
         * to make sure the latest frame is ready.
         */

        await wait(300);


        imageBlob =
            await captureCameraImage();


        sosPhoto.textContent =
            "Captured";


        console.log(
            "Emergency image captured."
        );


    } catch (error) {

        console.error(
            "Camera capture error:",
            error
        );


        sosPhoto.textContent =
            "Unavailable";

    }


    updateProgress(50);



    /* =========================================
       UPLOAD IMAGE TO IMGBB
    ========================================= */

    let imageURL = "";


    if (imageBlob) {

        try {

            sosPhoto.textContent =
                "Uploading";


            console.log(
                "Uploading image to ImgBB..."
            );


            imageURL =
                await uploadToImgBB(
                    imageBlob
                );


            sosPhoto.textContent =
                "Uploaded";


            console.log(
                "ImgBB upload successful:"
            );


            console.log(
                imageURL
            );


        } catch (error) {

            console.error(
                "ImgBB error:",
                error
            );


            sosPhoto.textContent =
                "Upload failed";

        }

    } else {

        console.warn(
            "No image available for ImgBB upload."
        );

    }


    updateProgress(75);



    /* =========================================
       SEND EMAIL
    ========================================= */

    try {

        sosEmail.textContent =
            "Sending";


        sosMessage.textContent =
            "Sending emergency alert...";


        console.log(
            "Sending emergency email..."
        );


        await sendEmergencyEmail(
            imageURL
        );


        sosEmail.textContent =
            "Sent";


        sosMessage.textContent =
            "Emergency alert successfully sent to your contact.";


        updateProgress(100);


        showToast(
            "Emergency email sent."
        );


        console.log(
            "✅ Emergency email sent."
        );


    } catch (error) {

        console.error(
            "EmailJS error:",
            error
        );


        sosEmail.textContent =
            "Failed";


        sosMessage.textContent =
            "Emergency email could not be sent. Check your EmailJS template settings.";


        updateProgress(100);


        showToast(
            "Email sending failed."
        );

    }



    /* =========================================
       STOP CAMERA
    ========================================= */

    stopCamera();

}



/* =========================================================
   CAMERA CAPTURE
   ========================================================= */

function captureCameraImage() {

    return new Promise(
        (resolve, reject) => {

            if (!cameraStream) {

                reject(
                    new Error(
                        "Camera stream unavailable."
                    )
                );

                return;

            }


            if (
                !cameraVideo.videoWidth ||
                !cameraVideo.videoHeight
            ) {

                reject(
                    new Error(
                        "Camera video is not ready."
                    )
                );

                return;

            }


            const width =
                cameraVideo.videoWidth;


            const height =
                cameraVideo.videoHeight;


            console.log(
                "Camera dimensions:",
                width,
                "x",
                height
            );


            cameraCanvas.width =
                width;


            cameraCanvas.height =
                height;


            const context =
                cameraCanvas.getContext(
                    "2d"
                );


            if (!context) {

                reject(
                    new Error(
                        "Could not access canvas."
                    )
                );

                return;

            }


            context.drawImage(

                cameraVideo,

                0,

                0,

                width,

                height

            );


            cameraCanvas.toBlob(

                function(blob) {

                    if (!blob) {

                        reject(
                            new Error(
                                "Browser could not create JPEG image."
                            )
                        );

                        return;

                    }


                    if (blob.size === 0) {

                        reject(
                            new Error(
                                "Captured image is empty."
                            )
                        );

                        return;

                    }


                    console.log(
                        "📷 Image captured:",
                        blob.size,
                        "bytes"
                    );


                    console.log(
                        "Image MIME type:",
                        blob.type
                    );


                    resolve(blob);

                },

                "image/jpeg",

                0.85

            );

        }
    );

}



/* =========================================================
   IMGBB UPLOAD
   ========================================================= */

async function uploadToImgBB(imageBlob) {

    console.log("========== IMGBB DEBUG ==========");

    if (!imageBlob) {
        throw new Error("No image blob received.");
    }

    console.log("Image type:", imageBlob.type);
    console.log("Image size:", imageBlob.size);

    if (imageBlob.size === 0) {
        throw new Error("Image blob is empty.");
    }

    const formData = new FormData();

    formData.append(
        "image",
        imageBlob,
        "awaaz-sos.jpg"
    );

    const url =
        `https://api.imgbb.com/1/upload?key=${CONFIG.IMGBB.API_KEY}`;

    console.log("Sending request to ImgBB...");

    const response = await fetch(
        url,
        {
            method: "POST",
            body: formData
        }
    );

    const rawResponse =
        await response.text();

    console.log(
        "ImgBB HTTP status:",
        response.status
    );

    console.log(
        "ImgBB response:",
        rawResponse
    );

    let data;

    try {
        data = JSON.parse(rawResponse);
    } catch {
        throw new Error(
            "ImgBB returned non-JSON response: " +
            rawResponse
        );
    }

    if (!response.ok) {

        const message =
            data?.error?.message ||
            data?.error?.code ||
            "Unknown ImgBB error";

        throw new Error(
            `ImgBB ${response.status}: ${message}`
        );
    }

    if (
        !data.success ||
        !data.data?.url
    ) {
        throw new Error(
            data?.error?.message ||
            "ImgBB did not return an image URL."
        );
    }

    console.log(
        "✅ Image uploaded successfully:"
    );

    console.log(
        data.data.url
    );

    return data.data.url;
}



/* =========================================================
   EMAILJS
   ========================================================= */

async function sendEmergencyEmail(
    imageURL
) {

    if (
        typeof emailjs === "undefined"
    ) {

        throw new Error(
            "EmailJS SDK is unavailable."
        );

    }



    /* -----------------------------------------
       Location information
    ----------------------------------------- */

    let locationURL =
        "Location unavailable";


    let latitude =
        "Unavailable";


    let longitude =
        "Unavailable";


    let accuracy =
        "Unavailable";


    if (currentLocation) {

        latitude =
            currentLocation.latitude;


        longitude =
            currentLocation.longitude;


        accuracy =
            Math.round(
                currentLocation.accuracy
            );


        locationURL =
            `https://www.google.com/maps?q=${latitude},${longitude}`;

    }



    /* -----------------------------------------
       EmailJS parameters
    ----------------------------------------- */

    const templateParams = {

        user_name:
            userName,

        emergency_email:
            emergencyEmail,

        alert_time:
            new Date().toLocaleString(
                "en-IN",
                {

                    dateStyle: "medium",

                    timeStyle: "medium"

                }
            ),

        trigger_phrase:
            CONFIG.TRIGGER_PHRASE,

        latitude:
            latitude,

        longitude:
            longitude,

        accuracy:
            accuracy,

        location_link:
            locationURL,

        image_link:
            imageURL ||
            "No emergency image was available."

    };


    console.log(
        "EmailJS parameters:",
        templateParams
    );



    /* -----------------------------------------
       Send email
    ----------------------------------------- */

    const response =
        await emailjs.send(

            CONFIG.EMAILJS.SERVICE_ID,

            CONFIG.EMAILJS.TEMPLATE_ID,

            templateParams

        );


    console.log(
        "EmailJS response:",
        response
    );


    return response;

}



/* =========================================================
   STOP CAMERA
   ========================================================= */

function stopCamera() {

    if (!cameraStream) {

        return;

    }


    console.log(
        "Stopping camera..."
    );


    cameraStream
        .getTracks()
        .forEach(
            track => track.stop()
        );


    cameraStream = null;


    cameraVideo.srcObject =
        null;

}



/* =========================================================
   PROGRESS BAR
   ========================================================= */

function updateProgress(
    percentage
) {

    progressBar.style.width =
        `${percentage}%`;

}



/* =========================================================
   EMAIL VALIDATION
   ========================================================= */

function isValidEmail(
    email
) {

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        .test(email);

}



/* =========================================================
   WAIT
   ========================================================= */

function wait(
    milliseconds
) {

    return new Promise(
        resolve =>
            setTimeout(
                resolve,
                milliseconds
            )
    );

}



/* =========================================================
   TOAST
   ========================================================= */

function showToast(
    message
) {

    toastText.textContent =
        message;


    toast.classList.add(
        "show"
    );


    setTimeout(
        () => {

            toast.classList.remove(
                "show"
            );

        },
        3000
    );

}