document.addEventListener('DOMContentLoaded', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const contentId = urlParams.get('contentId');

    if (!contentId) {
        document.getElementById('detailContent').innerText = 'No content ID provided';
        return;
    }

    // 두 API에서 데이터를 모두 가져오기
    Promise.all([
        fetch('/barrier-free-info', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contentId: contentId })
        }).then(response => response.json()),
        fetch('/get-disability-info-and-images', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ contentId: contentId })
        }).then(response => response.json())
    ])
    .then(([basicData, additionalData]) => {
        console.log('Basic Data:', basicData); // 추가된 로그
        console.log('Additional Data:', additionalData); // 추가된 로그
        displayDetails(basicData, additionalData);
    })
    .catch(error => {
        console.error('Error fetching data:', error);
        document.getElementById('detailContent').innerText = 'Error fetching data';
    });
});

function displayDetails(basicData, additionalData) {
    const detailsContent = document.getElementById('detailContent');
    detailsContent.innerHTML = ''; // Clear previous details

    // 기본 데이터 처리
    if (basicData.response && basicData.response.body && basicData.response.body.items) {
        const item = Array.isArray(basicData.response.body.items.item) ? basicData.response.body.items.item[0] : basicData.response.body.items.item;
        if (item) {
            const img = document.createElement('img');
            img.src = item.firstimage || 'images/default-image.jpg'; // Use default image
            img.alt = item.title || 'No title';

            const title = document.createElement('h2');
            title.textContent = item.title || '제목 없음';

            const addr = document.createElement('p');
            addr.textContent = item.addr1 || '주소 없음';

            const description = document.createElement('p');
            description.textContent = item.overview || 'No description available';

            const homepageLink = document.createElement('a');
            const parser = new DOMParser();
            const doc = parser.parseFromString(item.homepage, 'text/html');
            const link = doc.querySelector('a') ? doc.querySelector('a').href : '#';
            homepageLink.href = link;
            homepageLink.textContent = '홈페이지 이동';
            homepageLink.target = '_blank';

            detailsContent.appendChild(img);
            detailsContent.appendChild(title);
            detailsContent.appendChild(addr);
            detailsContent.appendChild(description);
            detailsContent.appendChild(homepageLink);
        } else {
            detailsContent.innerHTML = 'No details available';
        }
    } else {
        detailsContent.innerHTML = 'No details available';
    }

    // 추가 데이터 처리
    if (additionalData.disabilityInfo && additionalData.disabilityInfo.response.body.items.item) {
        const item = additionalData.disabilityInfo.response.body.items.item[0];

        const barrierInfo = document.createElement('div');
        barrierInfo.classList.add('barrier-info');
        barrierInfo.innerHTML = `
            <h3>무장애 편의 정보</h3>
            ${item.wheelchair ? `<p>휠체어: ${item.wheelchair}</p>` : ''}
            ${item.exit ? `<p>출구: ${item.exit}</p>` : ''}
            ${item.elevator ? `<p>엘리베이터: ${item.elevator}</p>` : ''}
            ${item.restroom ? `<p>장애인 화장실: ${item.restroom}</p>` : ''}
            ${item.guidesystem ? `<p>유도 시스템: ${item.guidesystem}</p>` : ''}
            ${item.blindhandicapetc ? `<p>시각 장애인 기타: ${item.blindhandicapetc}</p>` : ''}
            ${item.signguide ? `<p>표지판 안내: ${item.signguide}</p>` : ''}
            ${item.videoguide ? `<p>비디오 안내: ${item.videoguide}</p>` : ''}
            ${item.hearingroom ? `<p>청각 장애인 실: ${item.hearingroom}</p>` : ''}
            ${item.hearinghandicapetc ? `<p>청각 장애인 기타: ${item.hearinghandicapetc}</p>` : ''}
            ${item.stroller ? `<p>유모차: ${item.stroller}</p>` : ''}
            ${item.nursingroom ? `<p>수유실: ${item.nursingroom}</p>` : ''}
            ${item.babysparechair ? `<p>유아 보조 의자: ${item.babysparechair}</p>` : ''}
            ${item.babycarriage ? `<p>유아 및 가족 기타: ${item.babycarriage}</p>` : ''}
            ${item.auditorium ? `<p>강당: ${item.auditorium}</p>` : ''}
            ${item.room ? `<p>방: ${item.room}</p>` : ''}
            ${item.other ? `<p>기타 장애인 시설: ${item.other}</p>` : ''}
            ${item.braileblock ? `<p>점자 블록: ${item.braileblock}</p>` : ''}
            ${item.blindhandicapetc ? `<p>안내견: ${item.blindhandicapetc}</p>` : ''}
            ${item.guidesystem ? `<p>안내 인력: ${item.guidesystem}</p>` : ''}
            ${item.audioguide ? `<p>오디오 안내: ${item.audioguide}</p>` : ''}
            ${item.largeprintguide ? `<p>큰 글씨 안내: ${item.largeprintguide}</p>` : ''}
            ${item.brailepromotionalmaterial ? `<p>점자 홍보물: ${item.brailepromotionalmaterial}</p>` : ''}
            ${item.parking ? `<p>주차: ${item.parking}</p>` : ''}
            ${item.route ? `<p>경로: ${item.route}</p>` : ''}
            ${item.publictransport ? `<p>대중교통: ${item.publictransport}</p>` : ''}
            ${item.ticketoffice ? `<p>티켓 오피스: ${item.ticketoffice}</p>` : ''}
            ${item.promotionalmaterial ? `<p>홍보물: ${item.promotionalmaterial}</p>` : ''}
        `;
        detailsContent.appendChild(barrierInfo);
    } else {
        const noBarrierFreeInfo = document.createElement('p');
        noBarrierFreeInfo.innerText = 'No barrier-free information available';
        detailsContent.appendChild(noBarrierFreeInfo);
    }

    // 이미지 갤러리 추가
    if (additionalData.images && additionalData.images.response.body.items.item) {
        const imageGallery = document.createElement('div');
        imageGallery.className = 'image-gallery';
        additionalData.images.response.body.items.item.forEach(img => {
            const imgElement = document.createElement('img');
            imgElement.src = img.originimgurl;
            imageGallery.appendChild(imgElement);
        });
        detailsContent.appendChild(imageGallery);
    } else {
        const noImages = document.createElement('p');
        noImages.innerText = '이미지 없음';
        detailsContent.appendChild(noImages);
    }

}