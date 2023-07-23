async function fetchComments(record_id) {
    // get recent 4 comments (initial fetch)
    let c = await skapi.getRecords(
        {
            table: {
                name: 'comments',
                access_group: "authorized"
            },
            index: {
                name: 'comment.' + record_id,
                value: 0,
                condition: '>'
            }
        },
        {
            ascending: false,
            limit: 4
        }
    );

    if (!c.endOfList) {
        let showMoreButton = document.getElementById('showMoreCommentButton');
        if (showMoreButton) {
            showMoreButton.removeAttribute('hidden', '');
        }
    }

    for (let comment of c.list) {
        window[`${record_id}-commentSection`].append(commentPostToHtml(comment));
    }
}

async function addComment(event, record_id) {
    // post comment, append html in comment section
    let comment = await skapi.postRecord(event, {
        table: {
            name: "comments",
            access_group: "authorized"
        },
        index: {
            name: "comment." + record_id,
            value: Math.floor(Date.now() / 1000)
        }
    });

    event.target.reset();
    let commentBox = window[`${record_id}-commentSection`];
    commentBox.prepend(commentPostToHtml(comment));

    let currentCommentCount = parseInt(window[`${record_id}-commentCount`].innerHTML) || 0;
    window[`${record_id}-commentCount`].innerHTML = currentCommentCount + 1;

}

function commentPostToHtml(c) {
    // generate comment html from fetched comment data
    let comment = document.createElement('div');
    comment.innerHTML = `
            <pre style='white-space:pre-line;'>
                <span style='font-weight:bold'>${c.data.name}</span>
                ${c.data.comment}
                <span style='float:right;font-size: .8em'>${new Date(c.updated).toLocaleString()}</span>
            </pre>`;
    return comment;
}

// saves users 'like' status for each posts, so we can add/remove the like record.
let myLikes = {
    // ['liked record id']: 'like record id'
};

function like(record_id) {
    let likedButton = window[`${record_id}-likeButton`];
    let likeId = myLikes?.[record_id];
    if (likeId) {
        delete myLikes[record_id];
        skapi.deleteRecords({ record_id: likeId }).then(rec => {
            delete myLikes[record_id];
            let like_span = window[`${record_id}-likeCount`];
            let like_count = parseInt(like_span.textContent);
            like_span.innerHTML = (like_count - 1).toString();
            likedButton.textContent = 'LIKE';
        });
    }
    else {
        skapi.postRecord(null, {
            table: 'likes',
            reference: {
                record_id: record_id
            }
        }).then(rec => {
            let like_span = window[`${record_id}-likeCount`];
            let like_count = parseInt(like_span.textContent);
            like_span.innerHTML = (like_count + 1).toString();
            likedButton.textContent = 'LIKED';
            myLikes[record_id] = rec.record_id;
        });
    }
}
