const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = navigation.classList.toggle('is-open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    navigation.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

const revealItems = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

revealItems.forEach((item) => revealObserver.observe(item));

document.querySelector('#year').textContent = new Date().getFullYear();

let lastScrollY = window.scrollY;
let scrollArrowTimer;

window.addEventListener('scroll', () => {
  const currentScrollY = Math.max(window.scrollY, 0);
  const isScrollingDown = currentScrollY > lastScrollY + 4;

  if (isScrollingDown) {
    document.body.classList.add('is-scrolling-down');
    clearTimeout(scrollArrowTimer);
    scrollArrowTimer = setTimeout(() => {
      document.body.classList.remove('is-scrolling-down');
    }, 600);
  }

  if (currentScrollY < lastScrollY - 4) {
    document.body.classList.remove('is-scrolling-down');
  }

  lastScrollY = currentScrollY;
}, { passive: true });

const contactEndpoint = 'https://api.xipevents.com/api/contact';

document.querySelector('#contact-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const submitButton = form.querySelector('button[type="submit"]');
  const values = Object.fromEntries(new FormData(form));

  submitButton.classList.remove('is-arrow-animating');
  void submitButton.offsetWidth;
  submitButton.classList.add('is-arrow-animating');
  setTimeout(() => {
    submitButton.classList.remove('is-arrow-animating');
  }, 2000);

  submitButton.disabled = true;
  submitButton.setAttribute('aria-busy', 'true');
  message.textContent = 'Sending…';

  try {
    const response = await fetch(contactEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (!response.ok) {
      throw new Error('Contact request failed');
    }

    form.reset();
    message.textContent = 'Thanks — your message has been sent.';
  } catch (error) {
    message.textContent = 'Something went wrong. Please try again in a moment.';
  } finally {
    submitButton.disabled = false;
    submitButton.removeAttribute('aria-busy');
  }
});
