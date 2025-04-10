const API_BASE_URL = 'https://codeforces.com/api';

function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

document.addEventListener('DOMContentLoaded', () => {
    const typewriterElement = document.getElementById('typewriter-text');
    const text = typewriterElement.textContent;
    typeWriter(typewriterElement, text);
});

async function fetchUserData() {
    const username = document.getElementById('username').value.trim();
    if (!username) {
        showError('Please enter a username');
        return;
    }

    showLoading();
    try {
        const response = await fetch(`${API_BASE_URL}/user.info?handles=${username}`);
        const data = await response.json();

        if (data.status === 'OK' && data.result.length > 0) {
            const user = data.result[0];
            displayUserInfo(user);
            await fetchUserContests(username);
        } else {
            showError('User not found');
        }
    } catch (error) {
        showError('Error fetching user data. Please try again.');
        console.error('Error:', error);
    } finally {
        hideLoading();
    }
}

async function fetchUserContests(username) {
    try {
        const response = await fetch(`${API_BASE_URL}/user.rating?handle=${username}`);
        const data = await response.json();

        if (data.status === 'OK') {
            displayContests(data.result.slice(0, 5)); // Show last 5 contests
        }
    } catch (error) {
        console.error('Error fetching contests:', error);
    }
}

function displayUserInfo(user) {
    document.getElementById('profile-content').style.display = 'block';
    document.getElementById('error').style.display = 'none';

    const avatar = document.getElementById('avatar');
    avatar.src = user.avatar || 'https://codeforces.org/sites/all/themes/codeforces/images/user-avatar.jpg';
    avatar.alt = `${user.handle}'s avatar`;

    document.getElementById('user-name').textContent = user.handle;
    document.getElementById('user-rank').textContent = user.rank || 'Unrated';

    // Set stats
    document.getElementById('rating').textContent = user.rating || 'N/A';
    document.getElementById('max-rating').textContent = user.maxRating || 'N/A';
    document.getElementById('contribution').textContent = user.contribution || '0';
    document.getElementById('friends').textContent = user.friendOfCount || '0';
}

function displayContests(contests) {
    const contestsList = document.getElementById('contests-list');
    contestsList.innerHTML = '';

    contests.forEach(contest => {
        const contestElement = document.createElement('div');
        contestElement.className = 'contest-item';

        const ratingChange = contest.newRating - contest.oldRating;
        const ratingChangeClass = ratingChange >= 0 ? 'positive' : 'negative';

        contestElement.innerHTML = `
            <div>
                <strong>${contest.contestName}</strong>
                <div>Rank: ${contest.rank}</div>
            </div>
            <div class="${ratingChangeClass}">
                ${ratingChange >= 0 ? '+' : ''}${ratingChange}
            </div>
        `;

        contestsList.appendChild(contestElement);
    });
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
    document.getElementById('profile-content').style.display = 'none';
    document.getElementById('error').style.display = 'none';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message) {
    const errorElement = document.getElementById('error');
    errorElement.textContent = message;
    errorElement.style.display = 'block';
    document.getElementById('profile-content').style.display = 'none';
}

document.getElementById('username').addEventListener('keypress', function (event) {
    if (event.key === 'Enter') {
        fetchUserData();
    }
}); 