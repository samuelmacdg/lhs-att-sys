// JOHN GLAY C. BUNAO
// 12-RITCHIE

// ScrollReveal Animation
const sr = ScrollReveal({
    origin: 'top',
    distance: '60px',
    duration: 2500,
    delay: 400,
    // reset: true
})

sr.reveal('.home-img, .contact-img, .announcement, .profile', { origin: 'right' })
sr.reveal('.home-text, .contact-text, .sd-subjects, .td-sections', { origin: 'left' })
sr.reveal('.team-intro, .class-record, .student-record, .sd-text, .td-text')
sr.reveal('.team-grid', { interval: 100, delay: 50 })
sr.reveal('.footer-items, .footer-text', { interval: 100 })