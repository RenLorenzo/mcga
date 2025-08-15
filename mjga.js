(function(){
	const logo = document.getElementById('mjgaLogo');
	const lightbox = document.getElementById('lightbox');
	const backdrop = lightbox ? lightbox.querySelector('.lightbox-backdrop') : null;

	if (logo && lightbox) {
		logo.addEventListener('click', () => {
			lightbox.hidden = false;
		});
	}
	if (backdrop && lightbox) {
		backdrop.addEventListener('click', () => {
			lightbox.hidden = true;
		});
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape') lightbox.hidden = true;
		});
	}
})(); 