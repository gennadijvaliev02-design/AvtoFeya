const observer=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}})},{threshold:.08});document.querySelectorAll('.reveal').forEach((el,i)=>{el.style.transitionDelay=(i%3)*70+'ms';observer.observe(el)});
const menu=document.querySelector('.menu-toggle'),nav=document.querySelector('.header nav');menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Закрыть меню':'Открыть меню')});nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Открыть меню')}));
document.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});document.querySelectorAll('.work-item').forEach(item=>{item.hidden=button.dataset.filter!=='all'&&item.dataset.category!==button.dataset.filter})}));
const lightbox=document.querySelector('#lightbox');document.querySelectorAll('.work-item').forEach(item=>item.addEventListener('click',()=>{lightbox.querySelector('img').src=item.querySelector('img').src;lightbox.querySelector('img').alt=item.querySelector('img').alt;lightbox.querySelector('p').textContent=item.dataset.caption;lightbox.showModal()}));lightbox.querySelector('button').addEventListener('click',()=>lightbox.close());lightbox.addEventListener('click',e=>{if(e.target===lightbox)lightbox.close()});

const bookingForm=document.querySelector('#booking-form');
const bookingService=document.querySelector('#booking-service');
const bookingDate=document.querySelector('#booking-date');
const bookingTime=document.querySelector('#booking-time');
const bookingReady=document.querySelector('#booking-ready');
const bookingError=document.querySelector('#booking-error');
const localISO=date=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const today=new Date();bookingDate.min=localISO(today);
const formatDay=value=>new Date(`${value}T12:00:00`).toLocaleDateString('ru-RU',{day:'numeric',month:'long'});
for(let offset=0;offset<6;offset++){
  const day=new Date(today.getFullYear(),today.getMonth(),today.getDate()+offset);
  const button=document.createElement('button');button.type='button';button.dataset.date=localISO(day);button.setAttribute('aria-pressed','false');
  const weekday=document.createElement('span');weekday.textContent=offset===0?'Сегодня':day.toLocaleDateString('ru-RU',{weekday:'short'});
  const number=document.createElement('strong');number.textContent=day.getDate();
  button.append(weekday,number);button.setAttribute('aria-label',formatDay(button.dataset.date));
  button.addEventListener('click',()=>{bookingDate.value=button.dataset.date;updateBooking()});
  document.querySelector('#day-options').append(button);
}
function updateBooking(){
  document.querySelectorAll('[data-date]').forEach(button=>{const active=button.dataset.date===bookingDate.value;button.classList.toggle('selected',active);button.setAttribute('aria-pressed',String(active))});
  bookingReady.hidden=true;document.querySelector('#booking-whatsapp').removeAttribute('href');bookingError.textContent='';
  bookingDate.setCustomValidity('');bookingTime.setCustomValidity('');
}
bookingForm.addEventListener('input',updateBooking);
bookingForm.addEventListener('change',updateBooking);
document.querySelectorAll('[data-book-service]').forEach(link=>link.addEventListener('click',()=>{bookingService.value=link.dataset.bookService;updateBooking()}));
bookingForm.addEventListener('submit',event=>{
  event.preventDefault();
  const now=new Date();const moscowNow=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).format(now).replace(' ','T');
  if(`${bookingDate.value}T${bookingTime.value}`<=moscowNow){bookingError.textContent='Выберите будущие дату и время по Казани.';bookingTime.setCustomValidity('Это время уже прошло. Выберите другое.');bookingTime.reportValidity();return}
  const name=bookingForm.elements.name.value.trim(),car=bookingForm.elements.car.value.trim();
  if(!name||!car){bookingError.textContent='Укажите имя и модель автомобиля.';return}
  const note=bookingForm.elements.note.value.trim();
  const message=`Элина, здравствуйте! Хочу уточнить возможность записи.\n\nУслуга: ${bookingService.value}\nАвтомобиль: ${car}\nЖелаемая дата: ${formatDay(bookingDate.value)} ${bookingDate.value.slice(0,4)}\nУдобное время: ${bookingTime.value} (Казань)\nМеня зовут: ${name}${note?'\nПожелания: '+note:''}\n\nПодскажите, пожалуйста, свободно ли это время и какая будет стоимость?`;
  document.querySelector('#booking-whatsapp').href=`https://wa.me/79172227717?text=${encodeURIComponent(message)}`;
  bookingReady.hidden=false;bookingReady.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});
});

const bookingDialog=document.querySelector('#booking');
let bookingOpener=null;
function openBooking(opener){
  bookingOpener=opener;
  if(opener.dataset.bookService){bookingService.value=opener.dataset.bookService;updateBooking()}
  if(!bookingDialog.open){bookingDialog.showModal();document.body.classList.add('booking-open');bookingDialog.scrollTop=0}
}
document.querySelectorAll('a[href="#booking"],.floating-booking').forEach(trigger=>{
  trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','booking');
  trigger.addEventListener('click',event=>{event.preventDefault();openBooking(trigger)})
});
document.querySelector('.booking-close').addEventListener('click',()=>bookingDialog.close());
bookingDialog.addEventListener('click',event=>{if(event.target!==bookingDialog)return;const box=bookingDialog.getBoundingClientRect();if(event.clientX<box.left||event.clientX>box.right||event.clientY<box.top||event.clientY>box.bottom)bookingDialog.close()});
bookingDialog.addEventListener('close',()=>{document.body.classList.remove('booking-open');bookingOpener?.focus({preventScroll:true})});
