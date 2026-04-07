document.addEventListener('DOMContentLoaded', () => {
    
    // API Interaction (Open-Meteo as Free Mock for Gov Open Data Concept)
    const btnGetWeather = document.getElementById('btn-get-weather');
    const weatherCity = document.getElementById('weather-city');
    const weatherResult = document.getElementById('weather-result');
    const weatherText = document.getElementById('weather-text');
    const weatherIcon = document.getElementById('weather-icon');
    let fetchedWeatherInfo = "";

    const weatherCodes = {
        0: { icon: "☀️", text: "萬里無雲，晴朗好天氣" },
        1: { icon: "🌤️", text: "晴時多雲" },
        2: { icon: "⛅", text: "多雲" },
        3: { icon: "☁️", text: "陰天" },
        45: { icon: "🌫️", text: "有霧" },
        48: { icon: "🌫️", text: "有霧" },
        51: { icon: "🌦️", text: "毛毛雨" },
        53: { icon: "🌦️", text: "毛毛雨" },
        55: { icon: "🌧️", text: "持續降雨" },
        61: { icon: "🌧️", text: "陣雨" },
        63: { icon: "🌧️", text: "陣雨" },
        65: { icon: "🌧️", text: "大雨" },
        71: { icon: "🌨️", text: "下雪" },
        80: { icon: "🌦️", text: "陣雨" },
        81: { icon: "🌧️", text: "大陣雨" },
        82: { icon: "⛈️", text: "狂風大雨" },
        95: { icon: "⛈️", text: "雷雨" }
    };

    btnGetWeather.addEventListener('click', async () => {
        const coords = weatherCity.value.split(',');
        const lat = coords[0];
        const lon = coords[1];
        const cityName = weatherCity.options[weatherCity.selectedIndex].text;
        
        weatherResult.classList.remove('hidden');
        weatherText.textContent = `正在找尋 ${cityName} 的天氣大數據...`;
        
        try {
            // Using Open-Meteo as a free public data API to demonstrate integration
            const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto&forecast_days=1`);
            
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            const minT = data.daily.temperature_2m_min[0];
            const maxT = data.daily.temperature_2m_max[0];
            const wCode = data.daily.weathercode[0];
            
            const condition = weatherCodes[wCode] || { icon: "🌡️", text: "多變天氣" };
            
            weatherIcon.textContent = condition.icon;
            weatherText.innerHTML = `<strong>${cityName}今日預報：</strong>${condition.text}，氣溫 ${minT}°C ~ ${maxT}°C`;
            
            // Append this information to User Thoughts dynamically if not already there
            fetchedWeatherInfo = `參考天氣資訊：${cityName}為${condition.text}，約 ${minT}-${maxT}°C。`;
            
            weatherResult.style.backgroundColor = "rgba(225, 239, 230, 0.9)";
            
        } catch (error) {
            weatherIcon.textContent = "❌";
            weatherText.textContent = "無法取得天氣資料，請稍後再試。";
            console.error('API Fetch Error:', error);
        }
    });

    // Form logic
    const promptForm = document.getElementById('prompt-form');
    const resultSection = document.getElementById('result-section');
    const promptOutput = document.getElementById('prompt-output');
    const btnCopy = document.getElementById('btn-copy');
    const copyTextSpan = document.getElementById('copy-text');

    // Default dates
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    document.getElementById('start-date').valueAsDate = today;
    document.getElementById('end-date').valueAsDate = tomorrow;

    promptForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const startDate = document.getElementById('start-date').value;
        const endDate = document.getElementById('end-date').value;
        const location = document.getElementById('location').value;
        const budget = document.getElementById('budget').value;
        const rawThoughts = document.getElementById('thoughts').value;
        const outputFormat = document.getElementById('output-format').value;

        // Combine user thoughts with fetched weather info if available
        let finalThoughts = rawThoughts;
        if (fetchedWeatherInfo && !rawThoughts.includes("參考天氣")) {
            finalThoughts += `\n（${fetchedWeatherInfo}）`;
        }

        // Generating format example block based on selection
        let formatExample = "";
        if (outputFormat === "表格版") {
            formatExample = `範例輸出格式（表格版）
日期 | 行程類型 | 行程/餐點 | 預估時間 | 預估天氣 | 預算分配 | 實際感想（由使用者提供，AI整理）
---|---|---|---|---|---|---
4/10 | 室外 | 阿里山森林遊樂區健行 | 09:00–12:00 | 晴天，約20°C | 交通：500元、門票：300元 | 山林空氣清新，建議帶外套，早晨有點涼
4/10 | 室內 | 嘉義火雞肉飯 | 12:30–13:30 | 室內用餐 | 餐飲：120元 | 在地必吃美食，份量剛好，價格親民`;
        } else {
            formatExample = `範例輸出格式（條列式版）
日期：4/10
室外行程：阿里山森林遊樂區健行（09:00–12:00，晴天約20°C）
預算分配：交通 500元、門票 300元
實際感想（由使用者提供，AI整理）：山林空氣清新，建議帶外套，早晨有點涼

室內餐點：嘉義火雞肉飯（12:30–13:30，室內用餐）
預算分配：餐飲 120元
實際感想（由使用者提供，AI整理）：在地必吃美食，份量剛好，價格親民`;
        }

        // Generate the final prompt block
        const generatedPrompt = `角色設定
你是一位台灣國內旅遊的達人，熟悉各地景點、美食與行程安排。

使用者會提供的資訊：
出發與結束日期：${startDate} 到 ${endDate}
預算：${budget}
旅遊地點：${location}
使用者的「實際感想 / 特殊需求」：\n${finalThoughts}

AI 回覆格式要求：
請用「${outputFormat}」且固定格式，方便貼到 HackMD 儲存。
欄位包含：
- 日期
- 室內或室外行程及餐點
- 預估時間
- 預估天氣
- 預算分配（交通、餐飲、住宿、門票等）
- 使用者提供的「實際感想 / 需求」→ 請 AI 根據情境幫忙最後整理、排版結合進去

語氣與風格：
輕鬆、有條理
像導遊一樣親切解說

${formatExample}`;

        promptOutput.textContent = generatedPrompt;
        resultSection.classList.remove('hidden');
        
        // Scroll to result smoothness
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        
        // Reset copy button state in case generate is clicked multiple times
        btnCopy.innerHTML = "<i class='bx bx-copy'></i> <span id='copy-text'>一鍵複製</span>";
        btnCopy.style.backgroundColor = "rgba(0, 168, 232, 0.1)";
        btnCopy.style.color = "var(--primary-dark)";
    });

    // Copy to clipboard
    btnCopy.addEventListener('click', async () => {
        const textToCopy = promptOutput.textContent;
        try {
            await navigator.clipboard.writeText(textToCopy);
            btnCopy.innerHTML = "<i class='bx bx-check-double'></i> 複製成功！";
            btnCopy.style.backgroundColor = "#27ae60";
            btnCopy.style.color = "white";
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("複製失敗，請手動全選複製。");
        }
    });

});
