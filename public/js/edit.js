(function(global){
    function getQueryString(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]); return null;
    }

    var type = getQueryString('type');

    $('.addinfo_btn').on('click', function(){
        if(!type){
            return;
        }
        var reason = $('#reason').val();
        var name = $('#name').val();
        var Data = $('#Data').val();
        var score = $('#score').val();
        var obj = {
            type: type,
            Data: Data,
            reason: reason,
            score: score,
            name: name
        };

        $.ajax({
            type: 'POST',
            url: '/data/write',
            data: obj,
            success: function(data){
                if(data.status){
                    alert('添加数据成功');
                    window.location.reload();
                }else{
                    alert('添加失败');
                }
            },
            error: function(){
                alert('添加失败');
            },
            dataType: 'json'
        });

    });

})(window);
