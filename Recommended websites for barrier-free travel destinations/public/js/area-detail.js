document.addEventListener('DOMContentLoaded', () => {
    fetch('/area-codes')
        .then(response => response.json())
        .then(data => {
            const regionSelect = document.getElementById('regionSelect');
            data.forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                regionSelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error fetching area codes:', error));
});

let currentPage = 1;
let currentRegion = '';

function fetchTouristSpots() {
    const region = document.getElementById('regionSelect').value;
    if (!region) {
        alert('Please select a region.');
        return;
    }
    currentRegion = region;
    currentPage = 1;
    searchRegion(region, currentPage);
}

async function searchRegion(region, page) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    loadingSpinner.style.display = 'block';

    try {
        const response = await fetch('/search-region', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ region: region, pageNo: page })
        });

        if (response.ok) {
            const data = await response.json();
            displayResults(data.items, data.totalCount);
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

function displayResults(items, totalCount) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';

    if (items.length > 0) {
        const list = document.createElement('ul');
        items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.dataset.contentid = item.contentid;

            const img = document.createElement('img');
            img.src = item.firstimage || 'images/default-image.jpg';
            img.alt = item.title || 'No title';
            img.style.width = '100px';
            img.style.height = '100px';

            const itemInfo = document.createElement('div');
            itemInfo.className = 'item-info';
            const title = document.createElement('h3');
            title.textContent = item.title || 'No title';
            const addr = document.createElement('p');
            addr.textContent = item.addr1 || 'No address available';
            const description = document.createElement('p');
            description.textContent = item.overview || 'No description available';

            itemInfo.appendChild(title);
            itemInfo.appendChild(addr);
            itemInfo.appendChild(description);

            listItem.appendChild(img);
            listItem.appendChild(itemInfo);
            listItem.addEventListener('click', () => {
                window.location.href = `tourist-spot.html?contentId=${item.contentid}`;
            });
            

            list.appendChild(listItem);
        });
        resultsDiv.appendChild(list);
        displayPagination(totalCount);
    } else {
        resultsDiv.innerHTML = 'No results found';
    }
}

function displayPagination(totalCount) {
    const paginationDiv = document.getElementById('pagination');
    paginationDiv.innerHTML = '';

    const totalPages = Math.ceil(totalCount / 5);
    const maxPagesToShow = 5;
    let startPage = currentPage - Math.floor(maxPagesToShow / 2);
    startPage = Math.max(startPage, 1);
    let endPage = startPage + maxPagesToShow - 1;
    endPage = Math.min(endPage, totalPages);

    if (startPage > 1) {
        const prevButton = document.createElement('button');
        prevButton.innerHTML = '&laquo;';
        prevButton.className = 'arrow';
        prevButton.addEventListener('click', () => {
            currentPage = startPage - 1;
            searchRegion(currentRegion, currentPage);
        });
        paginationDiv.appendChild(prevButton);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            searchRegion(currentRegion, currentPage);
        });
        if (i === currentPage) {
            pageButton.style.backgroundColor = '#0056b3';
        }
        paginationDiv.appendChild(pageButton);
    }

    if (endPage < totalPages) {
        const nextButton = document.createElement('button');
        nextButton.innerHTML = '&raquo;';
        nextButton.className = 'arrow';
        nextButton.addEventListener('click', () => {
            currentPage = endPage + 1;
            searchRegion(currentRegion, currentPage);
        });
        paginationDiv.appendChild(nextButton);
    }
}