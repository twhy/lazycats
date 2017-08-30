(async function() {
  const URL = 'https://octocats.now.sh/api/octocats?pageSize=100'

  try {
    let cats = (await (await fetch(URL)).json()).data
    render(cats)
    lazyload(document.querySelectorAll('.cat .lazyload'))
  } catch (e) {
    console.log(e)
  }

  function render(cats) {
    document.querySelector('#cats').innerHTML = cats.map(cat => 
      `<div class="cat">
        <p>${cat.name}</p>
        <img class="lazyload" data-src="${cat.image}" src="http://via.placeholder.com/300x300">
       </div>`
    ).join('')
  }

  function lazyload(cats) {
    try {
      let observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.intersectionRatio > 0) {
            loadImage(entry.target, () => {
              observer.unobserve(entry.target)
            })
          }
        })
      }, { threshold: 0.01 })

      cats.forEach(cat => observer.observe(cat))
    } catch (e) {
      let imgs = [].slice.call(cats)

      let onscroll = throttle(function() {
        if (imgs.length === 0) {
          return window.removeEventListener("scroll", onscroll)
        }

        imgs = imgs.filter(img => img.classList.contains("lazyload"))
        imgs.forEach(img => inViewport(img) && loadImage(img))
      }, 300)

      window.addEventListener("scroll", onscroll)
      window.dispatchEvent(new Event("scroll"))
    }
  }

  function inViewport(img) {
    let { top, left, right, bottom } = img.getBoundingClientRect()
    let vpWidth = document.documentElement.clientWidth
    let vpHeight = document.documentElement.clientHeight
    return (
      (left > 0 && left < vpWidth || right > 0 && right < vpWidth) &&
      (top > 0 && top < vpHeight || bottom > 0 && bottom < vpHeight)
    )
  }

  function loadImage(img, callback) {
    let image = new Image()
    image.src = img.dataset.src
    image.onload = function() {
      img.src = image.src
      img.classList.remove('lazyload')
      if (typeof callback === 'function') callback()
    }
  }

  function throttle(func, wait) {
    let prev, timer
    return function fn() {
      let curr = Date.now()
      let diff = curr - prev
      if (!prev || diff >= wait) {
        func()
        prev = curr
      } else if (diff < wait) {
        clearTimeout(timer)
        timer = setTimeout(fn, diff)
      }
    }
  }

})()