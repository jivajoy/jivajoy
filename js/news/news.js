function init(){
    const storedNewsData = localStorage.getItem('newsData');
    
    if (storedNewsData === null) {
        fetchNews();
        console.log("Mengambil data dari API");
    } else {
        const newsWithTimestamp = JSON.parse(storedNewsData);
        const timestamp = new Date(newsWithTimestamp.timestamp);
        const currentTime = new Date();
        const diffInMs = currentTime - timestamp;
        const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

        if (diffInDays > 2) {
            fetchNews();
            console.log("Mengambil data dari API");
        } else {
            populate(newsWithTimestamp.data.results);
            console.log("Mengambil data dari local storage");
        }
    }
}

function populateMainPosts(data) {
    const newsBox = document.getElementById('news-box');

    newsBox.innerHTML = '';

    data.forEach((item, index) => {
        const listItem = document.createElement('li');
        listItem.classList.add('news_list-item', 'col-md-6');
        listItem.dataset.order = index + 1;

        const wrapper = document.createElement('div');
        wrapper.classList.add('news_list-item_wrapper', 'd-flex', 'flex-column');

        const media = document.createElement('div');
        media.classList.add('media');

        const picture = document.createElement('picture');
        const source = document.createElement('source');
        source.setAttribute('data-srcset', item.image); 
        source.setAttribute('srcset', item.image);
        source.setAttribute('type', 'image/webp');
        const img = document.createElement('img');
        img.classList.add('lazy');
        img.setAttribute('data-src', item.image);
        img.setAttribute('src', item.image);
        img.setAttribute('alt', 'post');

        picture.appendChild(source);
        picture.appendChild(img);
        media.appendChild(picture);

        const main = document.createElement('div');
        main.classList.add('main', 'd-flex', 'flex-column', 'justify-content-between');

        const metadata = document.createElement('div');
        metadata.classList.add('main_metadata');

        const dateItem = document.createElement('span');
        dateItem.classList.add('main_metadata-item');
        const dateIcon = document.createElement('i');
        dateIcon.classList.add('icon-calendar_day', 'icon');
        const dateText = document.createTextNode(item.date); 
        dateItem.appendChild(dateIcon);
        dateItem.appendChild(dateText);

        metadata.appendChild(dateItem);

        const titleLink = document.createElement('a');
        titleLink.classList.add('main_title', 'main_title--bookmarked');
        titleLink.setAttribute('href', item.url);
        titleLink.setAttribute('target', '_blank');
        titleLink.setAttribute('rel', 'noopener noreferrer');
        titleLink.textContent = item.title; 

        const previewParagraph = document.createElement('p');
        previewParagraph.classList.add('main_preview');
        previewParagraph.textContent = item.body.substring(0, 100) + '...';

        main.appendChild(metadata);
        main.appendChild(titleLink);
        main.appendChild(previewParagraph);

        wrapper.appendChild(media);
        wrapper.appendChild(main);

        listItem.appendChild(wrapper);

        newsBox.appendChild(listItem);
    });
}

function updateRecentPosts(data) {
    const recentPostList = document.getElementById('news-recent-post');

    recentPostList.innerHTML = '';

    data.sort((a, b) => new Date(b.date) - new Date(a.date));

    const recentPosts = data.slice(0, 4);

    recentPosts.forEach((item) => {
        const listItem = document.createElement('li');
        listItem.classList.add('list-item');

        const link = document.createElement('a');
        link.classList.add('d-flex', 'flex-column', 'flex-sm-row', 'align-items-sm-center');
        link.setAttribute('href', item.url); 

        const media = document.createElement('span');
        media.classList.add('media');

        const picture = document.createElement('picture');
        const source = document.createElement('source');
        source.setAttribute('data-srcset', item.image); 
        source.setAttribute('srcset', item.image);
        source.setAttribute('type', 'image/webp');
        const img = document.createElement('img');
        img.classList.add('preview');
        img.setAttribute('data-src', item.image);
        img.setAttribute('src', item.image);
        img.setAttribute('alt', 'post');

        picture.appendChild(source);
        picture.appendChild(img);
        media.appendChild(picture);

        const wrapper = document.createElement('span');
        wrapper.classList.add('wrapper');

        const title = document.createElement('span');
        title.classList.add('title');
        title.textContent = item.title; 

        const metadata = document.createElement('span');
        metadata.classList.add('metadata', 'd-flex', 'align-items-center');
        const calendarIcon = document.createElement('i');
        calendarIcon.classList.add('icon-calendar_day', 'icon');
        const dateText = document.createTextNode(item.date); 
        metadata.appendChild(calendarIcon);
        metadata.appendChild(dateText);

        wrapper.appendChild(title);
        wrapper.appendChild(metadata);

        link.appendChild(media);
        link.appendChild(wrapper);

        listItem.appendChild(link);

        recentPostList.appendChild(listItem);
    });
}

function createPagination(totalPages) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = ''; // Clear existing pagination links

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.classList.add('pagination-page');

        const pageLink = document.createElement('a');
        pageLink.classList.add('pagination-page_link', 'd-flex', 'align-items-center', 'justify-content-center');
        pageLink.setAttribute('href', '#');
        pageLink.textContent = i;

        // Add onclick attribute to each pagination link
        pageLink.setAttribute('onclick', `handlePaginationClick(${i})`);

        pageItem.appendChild(pageLink);
        paginationContainer.appendChild(pageItem);
    }
}



function handlePaginationClick(pageNumber) {
    const storedNewsData = JSON.parse(localStorage.getItem('newsData'));
    const allNewsData = storedNewsData.data.results;

    const itemsPerPage = 4;
    const startIndex = (pageNumber - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;

    const dataToShow = allNewsData.slice(startIndex, endIndex);

    populateMainPosts(dataToShow);
}

function populate(data) {
    const itemsPerPage = 4;
    const totalPages = Math.ceil(data.length / itemsPerPage);

    createPagination(totalPages); 
    handlePaginationClick(1);

    updateRecentPosts(data);
}

function fetchNews(){
    fetch("https://newsapi.ai/api/v1/article/getArticles?query=%7B%22%24query%22%3A%7B%22%24and%22%3A%5B%7B%22keyword%22%3A%22baby%20blues%22%2C%22keywordLoc%22%3A%22title%22%7D%2C%7B%22lang%22%3A%22ind%22%7D%5D%7D%2C%22%24filter%22%3A%7B%22forceMaxDataTimeWindow%22%3A%2231%22%7D%7D&resultType=articles&articlesSortBy=date&includeArticleOriginalArticle=true&apiKey=3b5a6149-3007-4a1e-8842-093fd28caf2c")
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const newsData = data.articles;
            
            const newsWithTimestamp = {
                data: newsData,
                timestamp: new Date().toISOString() 
            };

            localStorage.setItem('newsData', JSON.stringify(newsWithTimestamp));

            // console.log("Article berhasil di fetch");
        })
        .catch(error => {
            console.error('There was a problem with the fetch operation:', error);
        });
}

