document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('.button'); // 버튼 클릭 이벤트 생성

    button.addEventListener('click', () => {
        navigator.geolocation.getCurrentPosition(success, fail); // 위치 정보 요청
    });

    window.onload = () => { // 새로 고침하면 바로 위치 정보를 요청
        navigator.geolocation.getCurrentPosition(success, fail);
    }

    const success = (position) => {
        const latitude = position.coords.latitude; // 위도
        const longitude = position.coords.longitude; // 경도

        getWeather(latitude, longitude);
    };

    const fail = () => {
        alert("위치 접근이 허용되지 않았습니다.");
    }

    const tempSection = document.querySelector('.temperature');
    const placeSection = document.querySelector('.place');
    const descSection = document.querySelector('.description');
    const iconSection = document.querySelector('.icon');

    const getWeather = async (lat, lon) => {
        try {
            const response = await fetch('http://localhost:3000/get-weather', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ lat, lon }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const json = await response.json();
            const temperature = json.main.temp;
            const place = json.name;
            const description = json.weather[0].description;

            tempSection.innerText = `${temperature}°C`;
            placeSection.innerText = place;
            descSection.innerText = description;

            const icon = json.weather[0].icon;
            const iconURL = `http://openweathermap.org/img/wn/${icon}@2x.png`;

            iconSection.setAttribute('src', iconURL);
            iconSection.style.display = 'block'; // 이미지 로드 후 표시
        } catch (error) {
            alert('날씨 정보를 불러오는 데 실패했습니다: ' + error.message);
        }
    }
});
