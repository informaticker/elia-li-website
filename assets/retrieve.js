document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});

async function fetchTemperature() {
    const response = await fetch('https://language.apis.zhr1.infra.elia.network/v1/thoughts/temperature');
    return response.text();
}

async function fetchAndDisplay() {
    const responseDiv = document.querySelector('.response');
    const statsDiv = document.querySelector('.stats');
    let buffer = "";
    let charCount = 0;
    let startTime = performance.now();
    let initialText = responseDiv.textContent;
    const eraseDelay = 100;
    const printDelay = 50;
    const statsEraseDelay = 20;
    const statsPrintDelay = 40;
    let lastTemperature = "...";
    let lastTemperatureUpdateTime = 0;


    const response = await fetch('https://language.apis.zhr1.infra.elia.network/v1/thoughts/retrieve');
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');


    while (initialText.length > 0) {
        initialText = initialText.slice(0, -1);
        responseDiv.textContent = initialText;
        await new Promise(resolve => setTimeout(resolve, eraseDelay));
    }

    async function updateStatsAndTemperature() {
        let currentTime = (performance.now() - startTime) / 1000;
        let charsPerSecond = charCount / currentTime;
        

        if (currentTime - lastTemperatureUpdateTime >= 3) {
            try {
                lastTemperature = await fetchTemperature();
                lastTemperatureUpdateTime = currentTime;
            } catch (error) {
                lastTemperature = "None";
            }
        }
        

        statsDiv.textContent = `${charsPerSecond.toFixed(1)} chars/s, ${charCount} chars, ${currentTime.toFixed(1)}s, Temp: ${lastTemperature}°C`;
    }


    async function appendTextSmoothly(textPart) {
        buffer += textPart;

        while (buffer.length > 0) {
            let pos = buffer.indexOf('**');
            if (pos === 0) {
                let endPos = buffer.indexOf('**', 2);
                if (endPos !== -1) {
                    responseDiv.innerHTML += '<b>' + buffer.substring(2, endPos) + '</b>';
                    buffer = buffer.slice(endPos + 2);
                } else {
                    break;
                }
            } else {
                let nextPos = pos !== -1 ? pos : buffer.length;
                for (let i = 0; i < nextPos; i++) {
                    responseDiv.innerHTML += buffer[i];
                    await new Promise(resolve => setTimeout(resolve, printDelay));
                    charCount++;
                    await updateStatsAndTemperature();
                }
                buffer = buffer.slice(nextPos);
            }
        }
    }
    while (true) {
        const { value, done } = await reader.read();
        if (done) {
            if (buffer) {
                responseDiv.innerHTML += buffer;
            }
            break;
        }
        const text = decoder.decode(value, { stream: true });
        await appendTextSmoothly(text);
    }


    let statsText = statsDiv.textContent;
    while (statsText.length > 0) {
        statsText = statsText.slice(0, -1);
        statsDiv.textContent = statsText;
        await new Promise(resolve => setTimeout(resolve, statsEraseDelay));
    }


    await new Promise(resolve => setTimeout(resolve, 200));
    const message = '// video from hartnett media \\\\';
    let messageIndex = 0;
    while (messageIndex < message.length) {
        statsDiv.textContent += message[messageIndex];
        messageIndex++;
        await new Promise(resolve => setTimeout(resolve, statsPrintDelay));
    }
}

document.addEventListener('DOMContentLoaded', fetchAndDisplay);

console.log(`　　　　　  ___
　　　　 ／イ   フ
　　　　|  _  _|  
　 　 / ミ__xノ
　   /　　 　 |        
　　 /　 ヽ　　ﾉ         
   │　  | | |　　 　 
／￣|　　| | |　　 
| (￣ヽ_ヽ_)_)　
＼二つ`);
console.log("hello");   