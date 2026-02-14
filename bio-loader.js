/* ===========================
   GUT — Bio Content Loader
   =========================== */

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('bio-content.json');
        const data = await response.json();

        // Populate biography section
        const bioHeader = document.getElementById('bio-header');
        const bioTextContainer = document.getElementById('bio-text-container');
        const quoteText = document.getElementById('bio-quote-text');
        const quoteAuthor = document.getElementById('bio-quote-author');

        if (bioHeader) {
            bioHeader.textContent = data.biography.header;
        }

        if (bioTextContainer) {
            data.biography.paragraphs.forEach(para => {
                const p = document.createElement('p');
                p.className = 'bio-text';
                p.textContent = para;
                bioTextContainer.appendChild(p);
            });
        }

        if (quoteText) {
            quoteText.textContent = `"${data.biography.quote.text}"`;
        }

        if (quoteAuthor) {
            quoteAuthor.textContent = data.biography.quote.author;
        }

        // Populate band members
        const membersGrid = document.getElementById('members-grid');
        if (membersGrid) {
            data.bandMembers.forEach(member => {
                const card = document.createElement('div');
                card.className = 'member-card';

                card.innerHTML = `
                    <div class="member-img-wrapper">
                        <img src="${member.image}" alt="${member.name}">
                    </div>
                    <p class="member-name">${member.name}</p>
                    <p class="member-role">${member.role}</p>
                `;

                membersGrid.appendChild(card);
            });
        }
    } catch (error) {
        console.error('Error loading bio content:', error);
    }
});
