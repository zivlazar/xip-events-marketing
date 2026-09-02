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

document.querySelector('#contact-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const message = form.querySelector('.form-message');
  const values = Object.fromEntries(new FormData(form));
  const subject = encodeURIComponent(`XIP Events enquiry from ${values.organisation}`);
  const phone = values.phone ? `\nPhone: ${values.phone}` : '';
  const body = encodeURIComponent(`Name: ${values.name}\nOrganisation or festival: ${values.organisation}\nEmail: ${values.email}${phone}\n\n${values.message}`);

  message.textContent = 'Opening your email app with the enquiry ready to send.';
  window.location.href = `mailto:hello@xipevents.com?subject=${subject}&body=${body}`;
});
