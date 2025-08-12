const btn = document.getElementById("summarize");
const textToSpeechBtn = document.getElementById("textToSpeechBtn");
const searchMoreBtn = document.getElementById("searchMoreBtn");
const Translatebtn = document.getElementById("Translate");
const Savebtn = document.getElementById("Save");
const Notebtn = document.getElementById("Notes");
const downloadBtn = document.getElementById("downloadBtn");
const progressBar = document.getElementById("downloadProgress");
const progressPercentage = document.getElementById("progressPercentage");
const outputParagraph = document.getElementById("output");
const wordsCountHeading = document.getElementById("words_count");

var url;
var video_id;
var video_title;
progressBar.style.display = "none";
progressPercentage.style.display = "none";

btn.addEventListener("click", function() {
    btn.disabled = true;
    btn.innerHTML = "Summarizing...";
    chrome.tabs.query({currentWindow: true, active: true}, function(tabs){
         url = tabs[0].url;
         console.log("url="+url)
       

        var xhr = new XMLHttpRequest();
        xhr.open("GET", "http://127.0.0.1:5000/summary?url=" + url, true);
        xhr.onload = function() {
            var text = xhr.responseText;
            console.log(text);
            
            const p1 = document.getElementById("output");
            if(text=="Could not retrieve transcript: could not retrive summary for this video"){
                
                p1.innerHTML = text;
                // btn.disabled = false;
                btn.innerHTML = "Summarized";
                
                // textToSpeechBtn.style.display = "block"; // Show the text to speech button
                searchMoreBtn.style.display = "block"; // Show the search More Btn button
                downloadBtn.style.display = "block"; // Show the download Btn button
                // Savebtn.style.display = "block"; // Show the save Btn button
                // Translatebtn.style.display = "block"; // Show the translate Btn button
                // Notebtn.style.display = "block"; // Show the note Btn button
            }
            else{
                p1.innerHTML = text;
                // btn.disabled = false;
                btn.innerHTML = "Summarized";
                textToSpeechBtn.style.display = "block"; // Show the text to speech button
                searchMoreBtn.style.display = "block"; // Show the search More Btn button
                downloadBtn.style.display = "block"; // Show the download Btn button
                Savebtn.style.display = "block"; // Show the save Btn button
                Translatebtn.style.display = "block"; // Show the translate Btn button
                Notebtn.style.display = "block"; // Show the note Btn button
                
            }
            updateWordsCount();
        }
        xhr.send();
       
    });
});


//*********-----------FUNCTION FOR LISTEN ----------------************* */

textToSpeechBtn.addEventListener("click", function() {
    const textToSpeak = document.getElementById("output").textContent;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    const defaultVoice = speechSynthesis.getVoices().find(voice => voice.default);
    if (defaultVoice) {
        utterance.voice = defaultVoice;
    }
    speechSynthesis.speak(utterance);
});

//*********-----------FUNCTION FOR SEARCH MORE BUTTON----------------************* */

// fetching video Id
searchMoreBtn.addEventListener("click",function () {
    console.log(url)
    var s = url.match (/[?&]v=([^&]+)/); 
    if (s) {
         video_id=s[1];
        fetchVideoTitle(video_id);
    } else {
        console.error("Invalid YouTube URL:", url);
        return null;
    }
});


// FETCHING VIDEO TITLE
function fetchVideoTitle(video_id) {
    var API_KEY="AIzaSyCKLTZ0JiROCVda01VfF2SbuwPNWv-kLVw"; // for video  title fetch api (https://console.cloud.google.com/apis/credentials?project=driven-strength-420608)
    fetch(`https://www.googleapis.com/youtube/v3/videos?id=${video_id}&part=snippet&key=${API_KEY}`)
    .then(response => response.json())
    .then(data => {
         video_title = data.items[0].snippet.title;
        console.log("Video Title:", video_title);
        searchOnGoogle(video_title);
        // return video_title

    })
    .catch(error => {
        console.error("Error fetching video title:", error);
    });
}

// Function to perform a Google search using the Google Custom Search API
function searchOnGoogle(query) {
    var searchQuery = encodeURIComponent(query);
    var apiKey = 'AIzaSyDA9a78xOJhuMgqGzp31qArMeSJsK8Nt_I'; // Google Custom Search API key
    var cx = '115f2634d35ab4406'; // Custom Search Engine ID   (https://programmablesearchengine.google.com/controlpanel/overview?cx=115f2634d35ab4406)
    var apiUrl = `https://www.googleapis.com/customsearch/v1?q=${searchQuery}&key=${apiKey}&cx=${cx}`;
    console.log(apiUrl);

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                var firstResultUrl = data.items[1].link;
                console.log(firstResultUrl);
                window.open(firstResultUrl, '_blank');
            } else {
                console.error('No search results found.');
            }
        })
        .catch(error => {
            console.error('Error performing Google search:', error);
        });
}


// function fro wrod count
function countWords(text) {
    var words = text.split(/\s+/);
    return words.length;
}

// Function to update the words count heading
function updateWordsCount() {
    var textContent = outputParagraph.textContent || outputParagraph.innerText;
    var wordsCount = countWords(textContent);
    wordsCountHeading.textContent = "Summary in " + wordsCount + " words";
}

//*************------------TRANSLATION----------------************* */

Translatebtn.addEventListener("click", function() {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://127.0.0.1:5000/translate", true);
    xhr.onload = function() {
        var text1=xhr.responseText;
        console.log(text1)
        const p2=document.getElementById("output2");
        p2.innerHTML = text1;

        textToSpeechBtn.style.display = "block"; // Show the text to speech button
        searchMoreBtn.style.display = "block"; // Show the search More Btn button
        downloadBtn.style.display = "block"; // Show the download Btn button
        Savebtn.style.display = "block"; // Show the save Btn button
        Translatebtn.style.display = "block"; // Show the translate button 
        Notebtn.style.display = "block"; // Show the note button
    };
    xhr.send();
});

//*************------------DOWNLOAD----------------************* */

downloadBtn.addEventListener("click", function() {
    // Start the download
    downloadBtn. disabled= true;
    progressBar.style.display = "block";
    progressPercentage.style.display = "block";
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "http://127.0.0.1:5000/download?url=" + encodeURIComponent(url), true);
    xhr.onload = function() {
        var res=JSON.parse(xhr.responseText).text        
        if (res==="video already exists") {
            var response = JSON.parse(xhr.responseText);
            var filename = response.filename.toString();
            var p3 =document.getElementById("output3");
            p3.innerHTML= "Video Already Downloaded. "+"<br>Path:- "+ filename;
            progressBar.style.display = "none";
            progressPercentage.style.display = "none";
            

        }else {
            var response = JSON.parse(xhr.responseText);
            var filename = response.filename.toString();
            var p4 =document.getElementById("output4");
            p4.innerHTML= "Downloaded file: " + filename;
            console.error("Error during download:", res);
        }
    };
    xhr.send();

    
//*************------------POLL PROGRESS----------------************* */

    var progressInterval = setInterval(function() {
        var progressXhr = new XMLHttpRequest();
        progressXhr.open("GET", "http://127.0.0.1:5000/progress", true);
        progressXhr.onload = function() {
            if (progressXhr.status === 200) {
                var progress = JSON.parse(progressXhr.responseText).progress;
                progressBar.value = progress;
                progressPercentage.textContent = Math.round(progress) + "%"; // Update percentage text
                
                if (progress >= 100) {
                    clearInterval(progressInterval);
                    // downloadBtn.status.disabled;
                }
            }
        };
        progressXhr.send();
    }, 1000); // Poll every 1 second
});




// ***************---------FILE SAVE----------*******************
Savebtn.addEventListener("click",function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://127.0.0.1:5000/save",true)
    xhr.onload=function(){
       console.log("heelo");
       
        if (xhr.status === 200) {
            console.log("File saved successfully.");
        } else {
            console.error("Error saving file:", xhr.statusText);
        }
    };
    xhr.send();
})


Notebtn.addEventListener("click",function(){
    var xhr = new XMLHttpRequest();
    xhr.open("GET","http://127.0.0.1:5000/notes",true)
    xhr.onload=function(){
        console.log("hii");
        console.log(xhr.response);
        
         if (xhr.response ) {
            function formatTextToHtml(text) {
                // Replace double asterisks with <strong> for bold text
                let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                // Replace asterisks with <br> for new lines inside a paragraph
                formattedText = formattedText.replace(/\n?\* (.*?)\n/g, '<br> * $1<br>');
            
                // Wrap paragraphs with <p> tags
                formattedText = formattedText.split('\n\n').map(para => `<p>${para}</p>`).join('');
            
                return formattedText;
            }
            var p5=document.getElementById("output5");
            p5.innerHTML=formatTextToHtml(xhr.response);
            console.log("notes displays successfully.");
         } else {
            var p5=document.getElementById("output5");
            p5.innerHTML="SOORY!!, Unable to create Notes";
             console.error("Error displays notes:", xhr.statusText);
         }
     };
     xhr.send();
 })

