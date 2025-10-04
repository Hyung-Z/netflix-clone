import { initScrollHeader } from "./js/header/scrollHeader.js";
import Carousel from "./js/carousel/Carousel.js";

initScrollHeader("header", 150);

document.addEventListener("DOMContentLoaded", () => {
  fetch("/data.json")
    .then((res) => res.json())
    .then((data) => {
      const scrollboxE = document.querySelectorAll(".scrollbox");
      let names = Object.values(data);

      scrollboxE.forEach((box, idx) => {
        for (let n in names[idx]) {
          const name = names[idx][n];
          const cardElement = document.createElement("li");
          cardElement.innerHTML = `<img src="/db/${name}.jpg" alt="${name}">`;
          box.appendChild(cardElement);
        }
      });
    })
    .then(() => {
      document.querySelectorAll(".category").forEach((cat) => {
        cat.querySelectorAll("li").forEach((li) => {
          const likediv = document.createElement("div")
          likediv.classList.add('like-container')
          likediv.innerHTML =  "♡"
          li.appendChild(likediv)
        })
        new Carousel(cat, { loop: true });
      });
    });
});




document.querySelector("body").addEventListener("click", (e) => {
  if (e.target.classList.contains("like-container")) {
    if (e.target.innerHTML == "♥") {
      e.target.innerHTML = "♡";
    } else if (e.target.innerHTML == "♡") {
      e.target.innerHTML = "♥";
    }
  }
});
