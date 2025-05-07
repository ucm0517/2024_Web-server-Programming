document.addEventListener('DOMContentLoaded', function() {
    const userId = sessionStorage.getItem('userId'); // userId를 세션에서 가져옴

    if (userId) {
        fetchUserReviews(userId);
        fetchUserComments(userId);
    } else {
        console.error('사용자 ID가 없습니다.');
    }
});

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
            <button onclick="likeReview(${review.id})">좋아요</button> <!-- 좋아요 버튼 추가 -->
            <span id="likeCount-${review.id}">${review.likes}</span> <!-- 좋아요 개수 표시 -->
        `;
        reviewsContainer.appendChild(reviewDiv);
    });
}

function editReview(reviewId) {
    const newContent = prompt("새로운 리뷰 내용을 입력하세요:");
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
                alert("리뷰가 성공적으로 수정되었습니다.");
                fetchUserReviews(sessionStorage.getItem('userId')); // 리뷰 목록 새로고침
            } else {
                alert("리뷰 수정에 실패했습니다: " + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function deleteReview(reviewId) {
    if (confirm("정말 이 리뷰를 삭제하시겠습니까?")) {
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
                alert("리뷰가 성공적으로 삭제되었습니다.");
                fetchUserReviews(sessionStorage.getItem('userId')); // 리뷰 목록 새로고침
            } else {
                alert("리뷰 삭제에 실패했습니다: " + data.message);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}


function fetchUserComments(userId) {
    fetch('/user-comments', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userId: userId })
    })
    .then(response => response.json())
    .then(data => {
        const userComments = document.getElementById('userComments');
        userComments.innerHTML = ''; // 기존 댓글 내용 초기화
        data.comments.forEach(comment => {
            const commentDiv = document.createElement('div');
            commentDiv.className = 'comment';
            commentDiv.innerHTML = `<p>${comment.content}</p>`;
            userComments.appendChild(commentDiv);
        });
    })
    .catch(error => console.error('Error:', error));
}

function deleteAccount() {
    if (confirm('정말로 회원 탈퇴하시겠습니까?')) {
        fetch('/delete-account', {
            method: 'DELETE',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                alert('회원 탈퇴가 완료되었습니다.');
                sessionStorage.removeItem('loggedIn');
                sessionStorage.removeItem('username');
                sessionStorage.removeItem('userId'); // userId 제거
                window.location.href = 'index.html';
            } else {
                alert('회원 탈퇴 중 오류가 발생했습니다.');
            }
        })
        .catch(error => console.error('Error:', error));
    }
}

function logout() {
    sessionStorage.removeItem('loggedIn');
    sessionStorage.removeItem('username');
    sessionStorage.removeItem('userId'); // userId 제거
    window.location.href = 'index.html';
}

// 쿠키 가져오기 함수 추가
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}