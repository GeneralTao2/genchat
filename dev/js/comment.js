$(function() {
var commentForm;
var parentId;

  function createParentId(comment) {
    var parentComment = $(comment).parent();
    parentId = parentComment.attr('id');
    $(comment).after(commentForm);
    $(commentForm, comment).hide();
  }

  function form (isNew, comment) {
    //$('.reply').show();
    if(commentForm) {
      commentForm.remove();
    }
    parentId = null;
    commentForm = $('form.comment').clone(true, true);

    if(isNew) {
      commentForm.find('.cancel').hide();
      commentForm.appendTo('.comment-list');
    } else {
      var parentComment = $(comment).parent();
      parentId = parentComment.attr('id');
      $(comment).after(commentForm);
    }
    commentForm.css({ display: 'flex' });
}

  form(true);

//comments style
$('.acomment').hover(function() {
      $(this).addClass('hovered');
      if(!($('.comment', this).length >0)) {
        $('.reply', this).show();
      } else {
        $('.reply', this).hide();
      }
    },function() {
      $(this).removeClass('hovered');
      $('.reply', this).hide();
  })


  // add form
  $('.reply').on ('click', function() {
    form(false, $($(this).parent()).parent());
    $(this).hide();
  });

  $('form.comment .cancel').on('click', function(e) {
    e.preventDefault();
    commentForm.remove();
    form(true);
  });

  //publish
  $('form.comment .send').on('click', function(e) {
    e.preventDefault();
    var data = {
      post: $('.comments').attr('id'),
      body: commentForm.find('textarea').val(),
      parent: parentId
    };

    $.ajax({
      type: 'POST',
      data: JSON.stringify(data),
      contentType: 'application/json',
      url: '/comment/add'
    }).done(function(data) {
      console.log(data);
      if(!data.ok) {
        if(data.error === undefined) {
          $(commentForm).prepend('<p class="error">Неизвестная ошибка!</p>');
        }
        $(commentForm).prepend('<p class="error">'+data.error+'</p>');
      } else {
        var newComment =
        '<ul><li style="background-color:#ffffe0;"><div class="acomment"><div class="heads"><div class="head"><a href="/users/' +
          data.login +
          '">' +
          data.login +
          '</a><spam class="date">Только что</spam></div></div>' +
          data.body +
          '</div></li></ul>';
          $(commentForm).after(newComment);
          form(true);
      }
    });
  });

})
