/**
 *  作者：Senge
 *  最近更改时间：2018-3-3
 *  个人网站：waitting...
 *  邮箱：senge648647773@yeah.net
 */

function log(){
    console.log.apply(console, arguments)
}

// 回调函数将返回的内容添加到结果区（需要在页面加载完后加载上，为后面执行回调）
function jsonpcallback (rs) {
    var resultHtml = `歌曲：<strong>${rs.result.songs[0].name}</strong>
                     歌手：<strong>${rs.result.songs[0].artists[0].name}</strong>
                     <span id="id-span-toplay">立即播放</span>`
    result.innerHTML = resultHtml
    result.setAttribute('data-audio', rs.result.songs[0].audio)
    result.setAttribute('data-img', rs.result.songs[0].album.picUrl)
    result.setAttribute('data-music', rs.result.songs[0].name)
    result.setAttribute('data-singer', rs.result.songs[0].artists[0].name)
    result.style.opacity = '1'
}

function CreateScript (src) {
    var el = document.createElement('script')
    el.src = src
    el.async = true
    el.defer = true
    $('body').append(el)
}

function bind_search(){
    btn.click(function(){
        var value = input.val()
        if (!value) {
            alert('关键词不能为空')
            return
        }
        var data = {
            "type": 1,
            "limit": 1,
            "s": value,
            "callback": "jsonpcallback"
        }
        var url = "http://s.music.163.com/search/get/"
        var buffer = []
        for (var key in data) {
            buffer.push(key + '=' + encodeURIComponent(data[key]))
        }
        var fullpath = url + '?' + buffer.join('&')
        CreateScript(fullpath)
    })

    // 利用委托来为立即播放绑定事件
    result.onclick = function(e) {
        var t = e.target
        log(t)
        if (t.tagName === 'SPAN') {
            var oMusicSrc = result.getAttribute('data-audio')
            var oMusicImg = result.getAttribute('data-img')
            var oMusicName = result.getAttribute('data-music')
            var oSinger = result.getAttribute('data-singer')
            img.setAttribute('src',oMusicImg)
            song_name.text(oMusicName + '-' + oSinger)
            audio.setAttribute('src', oMusicSrc)
            audio.play()
            play.innerHTML = 'Pause'
            img.style.animation = 'xuanzhuan 5s linear infinite'
        }
    }
}

function auto_judge_cache(){
    setInterval(function(){
        // 已缓冲部分
        var buffered
        audio.readyState == 4 && (buffered = audio.buffered.end(0))
        cache_bar[0].style.width = (buffered / audio.duration * music_bar[0].clientWidth) + 'px'
    }, 1000)
}
// 自动更新音量条
function auto_process(){
    setInterval(function updatePlayedBar (){
        var musicBarWidth = music_bar[0].clientWidth
        var playedBarWidth = (audio.currentTime / audio.duration) * musicBarWidth
        music_played_bar[0].style.width = playedBarWidth + 'px'
        var a = audio.currentTime
        var mins = parseInt(a / 60)
        var secs = parseInt(a % 60)
        if (secs < 10) {
            $('#id-span-current').text(`${mins}:0${secs}`)
        }else {
            $('#id-span-current').text(`${mins}:${secs}`)
        }
        //如果是时间结束，并且是非单曲循环，自动下一曲
        if (audio.currentTime === audio.duration && !audio.loop) {
            next.onclick()
        }
    }, 1000)
}
// 进度条、音量条
function bind_volume(){
    voice_bar.click(function(e){
        var voiceBarWidth = voice_bar[0].clientWidth
		var new_volume = e.offsetX / voiceBarWidth
		audio.volume = new_volume
		voiced_bar[0].style.width = e.offsetX + 'px'
    })
}

function bind_process(){
    music_bar.click(function(e){
        var musicBarWidth = music_bar[0].clientWidth
        log('musicBarWidth', musicBarWidth)
		var newCurrentTime = (e.offsetX / musicBarWidth) * audio.duration
		audio.currentTime = newCurrentTime
		var playedBarWidth = (audio.currentTime / audio.duration) * musicBarWidth
		music_played_bar[0].style.width = playedBarWidth + 'px'
    })
}

function bind_controls1(){
    // 初始化音量条
    var voicedBarWidth = (audio.volume / 1) * voice_bar[0].clientWidth
    voiced_bar[0].style.width = voicedBarWidth + 'px'
    // 绑定进度条、音量条
    bind_process()
    bind_volume()
}
// 主要按钮
function bind_quiet(){
    $('#id-span-play_quiet').click(function(){
        if (!audio.muted) {
            audio.muted = true
            voiced_bar[0].style.width = 0 + 'px'
        }else {
            audio.muted = false
            var voice_bar_width = voice_bar[0].clientWidth
            voiced_bar[0].style.width = (audio.volume / 1) * voice_bar_width + 'px'
        }
    })
}

function start_play(){
    song_name.text(sources[currentSrcIndex].title)
    $(audio).bind('canplay', function(){
        var a = audio.duration
        var mins = parseInt(a / 60)
        var secs = parseInt(a % 60)
        if (secs < 10) {
            $('#id-span-total').text(`${mins}:0${secs}`)
        }else {
            $('#id-span-total').text(`${mins}:${secs}`)
        }
    })
}

function bind_play(){
    play.click(function(){
        if (audio.paused) {
            audio.play()
            play.text('Pause')
            cover[0].style.animation = 'rotate 5s linear infinite'

        }else {
            audio.pause()
            play.text('Play')
            cover[0].removeAttribute('style')
        }
    })
    start_play()
}

function change_song(flag){
    if (flag === 'next') {
        ++ currentSrcIndex > sources.length - 1 && (currentSrcIndex = 0); // 下一曲
    } else {
        -- currentSrcIndex < 0 && (currentSrcIndex = sources.length -1); // 上一曲
    }
    audio.src = sources[currentSrcIndex].src
    img.src = sources[currentSrcIndex].dataset.img
    audio.play()
    cover[0].style.animation = 'rotate 5s linear infinite'
    play.text('Pause')
    start_play()
}

function bind_play_prev_next(){
    //...
    var prev = $('#id-span-prev')
    var next = $('#id-span-next')

    prev.click(function(){
        change_song('prev')
    })
    next.click(function(){
        change_song('next')
    })
    start_play()
}

 function bing_playmode(){
    //...
    play_mode.click(function(){
        if (audio.loop) {
            audio.loop = false
            play_mode.text('循环')
        }else {
            audio.loop = true
            play_mode.text('单曲')
        }
    })
 }

function bind_controls2(){
    /*
        播放模式
        上下首
        播放、暂停
        静音
    */
    bing_playmode()
    bind_play_prev_next()
    bind_play()
    bind_quiet()
}

function initial_var(){
    cover = $('#id-img-initial')
    cache_bar = $('#id-span-load_bar')
    audio = $('audio')[0]
    currentSrcIndex = 0
    audio.volume = 0.5
    play = $('#id-span-play')
    img = $("#id-img-initial")[0]
    sources = $('source')
    song_name = $('.song_name')
    voice_bar = $('.voice')
    voiced_bar = $('#id-span-voiced')
    play_mode = $("#id-span-play_mode")
    music_bar = $('.music_process')
    music_played_bar = $('#id-span-played_bar')
    btn = $('#id-span-search')
    input = $('input')
    result = $('#id-span-result')[0]
}

function __main(){
    // 定义全局变量
    initial_var()
    // 先绑定controls-2 中的元素
    bind_controls2()
    // 绑定controls-1 中的元素
    bind_controls1()
    // 音乐播放时自动更新进度栏
    auto_process()
    // 判断文件缓冲进度
    auto_judge_cache()
    // 绑定搜索按钮
    bind_search()
}

__main()
