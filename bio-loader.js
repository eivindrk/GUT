document.addEventListener('DOMContentLoaded', function() {
    fetch('bio-content.json')
        .then(response => response.json())
        .then(data => {
            // Populate biography section
            document.getElementById('bio-header').textContent = data.biography.header;
            
            const bioTextContainer = document.getElementById('bio-text-container');
            data.biography.paragraphs.forEach(para => {
                const p = document.createElement('p');
                p.className = 'bio-text';
                p.textContent = para;
                bioTextContainer.appendChild(p);
            });

            document.getElementById('bio-quote-text').textContent = data.biography.quote.text;
            document.getElementById('bio-quote-author').textContent = data.biography.quote.author;

            // Populate band members section
            const bandPresentation = document.querySelector('.band-presentation');
            bandPresentation.innerHTML = ''; // Clear existing content

            data.bandMembers.forEach(member => {
                const memberDiv = document.createElement('div');
                memberDiv.className = 'band-member';

                let imgClass = 'member-pic';
                if (member.name === 'Johan Nes') {
                    imgClass = 'member-pic-johan';
                } else if (member.name === 'Håkon Bjåstad') {
                    imgClass = 'member-pic-hakon';
                }

                memberDiv.innerHTML = `
                    <div class="img-div-${member.name.split(' ')[0].toLowerCase()}">
                        <img class="${imgClass}" src="${member.image}" alt="">
                    </div>
                    <div>
                        <p class="member-name">${member.name} //</p>
                        <p class="member-info">${member.role}</p>
                    </div>
                `;
                bandPresentation.appendChild(memberDiv);
            });
        })
        .catch(error => console.error('Error loading bio content:', error));
});
