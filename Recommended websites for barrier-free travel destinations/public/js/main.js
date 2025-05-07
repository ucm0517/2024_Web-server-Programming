document.addEventListener('DOMContentLoaded', function() {
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    const userId = sessionStorage.getItem('userId'); // userId를 세션에서 가져옴
    
    if (userId) {
        fetchUserReviews(userId); // userId를 사용하여 리뷰 가져오기
    } else {
        console.error('사용자 ID가 없습니다.');
    }

    dropdownToggles.forEach(toggle => {
        toggle.addEventListener('mouseover', function() {
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('nav-dropdown')) {
                dropdown.style.display = 'block';
            }
        });

        toggle.addEventListener('mouseout', function() {
            const dropdown = this.nextElementSibling;
            if (dropdown && dropdown.classList.contains('nav-dropdown')) {
                dropdown.style.display = 'none';
            }
        });
    });

    const dropdowns = document.querySelectorAll('.nav-dropdown');

    dropdowns.forEach(dropdown => {
        dropdown.addEventListener('mouseover', function() {
            this.style.display = 'block';
        });

        dropdown.addEventListener('mouseout', function() {
            this.style.display = 'none';
        });
    });

    let currentPage = 1;
    let currentKeyword = '';

    document.getElementById('searchForm').addEventListener('submit', function(event) {
        event.preventDefault();
        const keyword = document.getElementById('keyword').value;
        if (!keyword) {
            alert('Please enter a keyword.');
            return;
        }
        currentKeyword = keyword;
        currentPage = 1;
        searchKeyword(keyword, currentPage);
    });

    async function searchKeyword(keyword, page) {
        console.log(`Searching for keyword: ${keyword}, page: ${page}`);

        const loadingSpinner = document.getElementById('loadingSpinner');
        loadingSpinner.style.display = 'block';

        try {
            const response = await fetch('http://localhost:3000/search-keyword', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ keyword: keyword, pageNo: page })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Received data:', data);
                displayResults(data);
            } else {
                console.error('Error fetching data', response.status);
                document.getElementById('results').innerHTML = 'Error fetching data';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('results').innerHTML = 'Error fetching data';
        } finally {
            loadingSpinner.style.display = 'none';
        }
    }

    async function fetchDetails(contentId) {
        console.log(`Fetching details for contentId: ${contentId}`);

        try {
            const response = await fetch('http://localhost:3000/get-disability-info-and-images', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ contentId: contentId })
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Received detail data:', data);
                localStorage.setItem('detailData', JSON.stringify(data));
                window.location.href = 'details.html';
            } else {
                console.error('Error fetching detail data', response.status);
                document.getElementById('detailsContent').innerHTML = 'Error fetching detail data';
            }
        } catch (error) {
            console.error('Error:', error);
            document.getElementById('detailsContent').innerHTML = 'Error fetching detail data';
        }
    }

    function displayResults(data) {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';

        if (data.response && data.response.body && data.response.body.items) {
            const items = data.response.body.items.item;
            if (items && items.length > 0) {
                const list = document.createElement('ul');
                items.forEach(item => {
                    const listItem = document.createElement('li');
                    listItem.classList.add('search-result-item');

                    const img = document.createElement('img');
                    img.src = item.firstimage || 'default_image.png';
                    img.alt = item.title;

                    const itemInfo = document.createElement('div');
                    itemInfo.className = 'item-info';
                    const title = document.createElement('h3');
                    title.textContent = item.title;
                    const addr = document.createElement('p');
                    addr.textContent = item.addr1;
                    const description = document.createElement('p');
                    description.textContent = item.overview || 'No description available';

                    itemInfo.appendChild(title);
                    itemInfo.appendChild(addr);
                    itemInfo.appendChild(description);

                    listItem.appendChild(img);
                    listItem.appendChild(itemInfo);
                    listItem.addEventListener('click', () => fetchDetails(item.contentid));

                    list.appendChild(listItem);
                });
                resultsDiv.appendChild(list);
                displayPagination(data.response.body.totalCount);
            } else {
                resultsDiv.innerHTML = 'No results found';
            }
        } else {
            resultsDiv.innerHTML = '검색 결과가 없습니다.';
        }
    }

    function displayPagination(totalCount) {
        const paginationDiv = document.getElementById('pagination');
        paginationDiv.innerHTML = '';

        const totalPages = Math.ceil(totalCount / 5);
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, startPage + 4);

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.innerHTML = '&laquo;';
            prevButton.className = 'arrow';
            prevButton.addEventListener('click', () => {
                currentPage--;
                searchKeyword(currentKeyword, currentPage);
            });
            paginationDiv.appendChild(prevButton);
        }

        for (let i = startPage; i <= endPage; i++) {
            const pageButton = document.createElement('button');
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                currentPage = i;
                searchKeyword(currentKeyword, currentPage);
            });
            paginationDiv.appendChild(pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.innerHTML = '&raquo;';
            nextButton.className = 'arrow';
            nextButton.addEventListener('click', () => {
                currentPage++;
                searchKeyword(currentKeyword, currentPage);
            });
            paginationDiv.appendChild(nextButton);
        }
    }

    // 로그인 상태 관리 로직 추가
    const loggedIn = sessionStorage.getItem('loggedIn');
    const username = sessionStorage.getItem('username');
    if (loggedIn) {
        document.getElementById('login-link').style.display = 'none';
        document.getElementById('logout-link').style.display = 'inline';
        document.getElementById('mypage-link').style.display = 'inline';
        document.getElementById('mypage-link').textContent = username + '의 페이지';

        // 리뷰와 댓글을 가져오기
        fetchUserReviews(userId); // userId를 사용하여 리뷰 가져오기
    } else {
        document.getElementById('login-link').style.display = 'inline';
        document.getElementById('logout-link').style.display = 'none';
        document.getElementById('mypage-link').style.display = 'none';
    }

    function logout() {
        sessionStorage.removeItem('loggedIn');
        sessionStorage.removeItem('username');
        window.location.href = 'index.html';
    }

    function fetchUserReviews(userId) {
        fetch('/user-reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: userId }) // userId를 보냄
        })
        .then(response => response.json())
        .then(data => {
            console.log('User Reviews:', data); // 서버에서 받은 데이터 로그 출력
            if (data.success) {
                displayUserReviews(data.reviews);
            } else {
                console.error('리뷰를 가져오는 중 오류가 발생했습니다.');
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function displayUserReviews(reviews) {
        const reviewsContainer = document.getElementById('userReviews');
        reviewsContainer.innerHTML = ''; // 기존 내용을 지움
        reviews.forEach(review => {
            const reviewDiv = document.createElement('div');
            reviewDiv.classList.add('review-item');
            reviewDiv.innerHTML = `
                <p>${review.content}</p>
                ${review.image ? `<img src="/uploads/${review.image}" alt="Review Image">` : ''}
                <button onclick="editReview(${review.id})">수정</button>
                <button onclick="deleteReview(${review.id})">삭제</button>
            `;
            reviewsContainer.appendChild(reviewDiv);
        });
    }

    function editReview(reviewId) {
        const newContent = prompt('새로운 리뷰 내용을 입력하세요:');
        if (newContent) {
            fetch('/edit-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewId: reviewId, newContent: newContent })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('리뷰가 수정되었습니다.');
                    location.reload(); // 수정된 리뷰를 표시하기 위해 페이지 새로고침
                } else {
                    alert('리뷰 수정에 실패했습니다.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function deleteReview(reviewId) {
        if (confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
            fetch('/delete-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewId: reviewId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('리뷰가 삭제되었습니다.');
                    location.reload(); // 삭제된 리뷰를 표시하기 위해 페이지 새로고침
                } else {
                    alert('리뷰 삭제에 실패했습니다.');
                }
            })
            .catch(error => console.error('Error:', error));
        }
    }

    function likeReview(reviewId) {
        const userId = sessionStorage.getItem('userId'); // userId 가져오기
        if (userId) {
            fetch('/like-review', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ reviewId: reviewId, userId: userId })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const likeCountSpan = document.getElementById(`likeCount-${reviewId}`);
                    likeCountSpan.textContent = data.likes; // 새로운 좋아요 개수 업데이트
                } else {
                    alert('좋아요를 누르는데 실패했습니다.');
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            alert('로그인이 필요합니다.');
        }
    }


});

// 여행 명언
const quotes = [
    "여행은 당신을 겸손하게 만든다. 세상에서 당신이 차지하는 위치가 얼마나 작은 것인지를 깨닫게 해준다. - 귀스타브 플로베르",
    "여행을 떠나는 이유는 돌아오기 위해서이다. - 체 게바라",
    "여행은 짧고, 인생은 더 짧다. - 공자",
    "여행을 떠나는 순간, 새로운 인생이 시작된다. - 마크 트웨인",
    "세상은 한 권의 책이며, 여행하지 않는 자는 그 책의 한 페이지만 읽는 것이다. - 성 아우구스티누스"
];

function showNewQuote() {
    const quoteElement = document.getElementById("quote");
    const randomIndex = Math.floor(Math.random() * quotes.length);
    quoteElement.innerText = quotes[randomIndex];
}