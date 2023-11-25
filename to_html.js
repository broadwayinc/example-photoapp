let userList = {};
function postToHtml(p) {
    // generate photo html from fetched posted data, fetch additional comment, like data

    let html = `
        <div style='padding:.5rem'>
            <a href='post.html?rid=${p.record_id}'>    
                <img style='width: 100%;' id='${p.record_id}-Img'>
            </a>
            <br>
            <pre style='margin: 0;display: inline-block;vertical-align: middle;'>Liked: <span id='${p.record_id}-likeCount'>${p.reference.referenced_count}</span></pre>
            <button id='${p.record_id}-delButton' style='float:right' onclick='skapi.deleteRecords({record_id: "${p.record_id}"}).then(()=>initialFetch())' ${user.user_id !== p.user_id ? "hidden" : ""}>DELETE</button>
            <button id='${p.record_id}-likeButton' style='float:right' onclick='like("${p.record_id}")'>...</button>
            <p style='font-weight:bold' id='${p.record_id}-userName'>...</p>
            ${new Date(p.updated).toLocaleString()}
            <p>${p.data?.description || '&nbsp;'}</p>
            Tags: ${(p.tags || []).join(', ')}
        </div>
        <div style='padding:.5rem;margin-bottom: 1rem;'>
            <a href='post.html?rid=${p.record_id}'>Comments (<span id='${p.record_id}-commentCount'>0</span>)</a><br><br>
            <form style='display:flex;flex-wrap:wrap;' onsubmit='addComment(event, "${p.record_id}");'>
                <input name='name' hidden value='${user.name}'>
                <input style='flex-grow:1;' name='comment' placeholder='Write Comment'>
                <input type='submit'>
            </form>
            <div id='${p.record_id}-commentSection'></div>
        </div>`;

    // get the image endpoint, set the img src attribute.
    p.bin.photo[0].getFile('endpoint').then(url => {
        window[`${p.record_id}-Img`].src = url;
    });

    // get user name
    if (!userList[p.user_id]) {
        userList[p.user_id] = skapi.getUsers({
            searchFor: 'user_id',
            value: p.user_id
        });
    }

    userList[p.user_id].then(u => {
        window[`${p.record_id}-userName`].innerHTML = u.list[0].name;
    });

    // get users like
    skapi.getRecords({
        table: 'likes',
        index: {
            name: '$user_id',
            value: user.user_id
        },
        reference: p.record_id
    }).then(l => {
        if (l.list.length) {
            myLikes[p.record_id] = l.list[0].record_id;
            window[`${p.record_id}-likeButton`].textContent = 'LIKED';
        }
        else {
            window[`${p.record_id}-likeButton`].textContent = 'LIKE';
        }
    });

    // get recent 4 comments.
    fetchComments(p.record_id); // refer: likes_comments.js

    // get comment count
    skapi.getIndexes({
        table: 'comments',
        index: 'comment.' + p.record_id
    }).then(commentInfo => {
        let count = 0;
        if (commentInfo.list.length) {
            count = commentInfo.list[0].number_of_records;
        }

        window[`${p.record_id}-commentCount`].innerHTML = count;
    });

    // create div and return
    let div = document.createElement('div');
    div.style.backgroundColor = 'ivory';
    div.innerHTML = html;

    return div;
}
