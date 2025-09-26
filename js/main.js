import { initScrollHeader } from "./header/scrollHeader.js";
import Carousel from "./carousel/Carousel.js";

initScrollHeader("header", 150);

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".category").forEach((cat) => {
    new Carousel(cat, { loop: true });
  });
});

fetch("https://raw.githubusercontent.com/Hyung-Z/tvshowgame/refs/heads/main/data.json")
  .then(res=>res.json())
  .then(data => {
    var song_10 =[] 
    var song_15 = []
    var song_20 = [] 
    var song_25 = []
    var song_2425 = []

    for (let key in data) {
      if (data[key].length <= 4) {
        continue
      }

      let year = parseInt(data[key][4].slice(0,4)) 

      if (year <= 2010) {
        song_10.push(data[key])
      }
      else if (year <= 2015) {
        song_15.push(data[key])
      }
      else if (year <= 2020) {
        song_20.push(data[key])
      }
      else if (year <= 2025) {
        song_25.push(data[key])
      }
      if (year == 2024 || year == 2025) {
        song_2425.push(data[key])
      }
    }

    const song_data = [song_10, song_15, song_20, song_25, song_2425]
    document.querySelectorAll(".category").forEach((cat,idx)=> {
        const cat_data = song_data[idx]
        cat.querySelectorAll('.scrollbox li').forEach((li,idx) => {
            const track = cat_data[idx][1][0]
            const name = cat_data[idx][2]
            const date = cat_data[idx][4]
            if (li.innerHTML.includes('box')) {
                li.innerHTML = `<p>${track}</p><br><p>${name}</p><br><p>${date}</p>`
            }
        })
    })

  })
