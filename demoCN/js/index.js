var myCrop;
require(["jquery", 'hammer', 'tomPlugin', "tomLib", 'hammer.fake', 'hammer.showtouch'], function($, hammer, plugin, T) {
    document.addEventListener("touchmove", function(e) {
        e.preventDefault();
    })
    //初始化图片大小
    var screenWidth = document.documentElement.clientWidth;
    var screenHeight = document.documentElement.clientHeight;

    var opts = {
            cropWidth: screenWidth,
            cropHeight: 300
        },
        $file = $("#file"),
        previewStyle = {
            x: 0,
            y: 0,
            scale: 1,
            rotate: 0,
            ratio: 1
        },
        transform = T.prefixStyle("transform"),
        $previewResult = $("#previewResult"),
        $previewBox = $(".preview-box"),
        $rotateBtn = $("#rotateBtn"),
        $getFile = $("#getFile"),
        $preview = $("#preview"),
        $uploadPage = $("#uploadPage"),
        $mask = $(".upload-mask"),
        maskCtx = $mask[0].getContext("2d");

    //这是插件调用主体
    myCrop = T.cropImage({
        bindFile: $file,
        enableRatio: true, //是否启用高清,高清得到的图片会比较大
        canvas: $(".photo-canvas")[0], //放一个canvas对象
        cropWidth: opts.cropWidth, //剪切大小
        cropHeight: opts.cropHeight,
        bindPreview: $preview, //绑定一个预览的img标签
        useHammer: true, //是否使用hammer手势，否的话将不支持缩放
        oninit: function() {

        },
        onLoad: function(data) {
            //用户每次选择图片后执行回调
            resetUserOpts();
            previewStyle.ratio = data.ratio;
            $preview.attr("src", data.originSrc).css({
                width: data.width,
                height: data.height
            }).css(transform, 'scale(' + 1 / previewStyle.ratio + ')');
            myCrop.setCropStyle(previewStyle);
        }
    });

    function resetUserOpts() {
        $(".photo-canvas").hammer('reset');
        previewStyle = {
            scale: 1,
            x: 0,
            y: 0,
            rotate: 0
        };
        $previewResult.attr("src", '');
        $preview.attr("src", '');
    }
    $(".photo-canvas").hammer({
        gestureCb: function(o) {
            //每次缩放拖拽的回调
            $.extend(previewStyle, o);
            console.log("用户修改图片", previewStyle);
            var body = document.body,
                html = document.documentElement;

                var uploadTop = $(".upload-mask").offset().top+previewStyle.y;
                var boxTop = $(".photo-canvas").offset().top;

                var boxBottomTop = boxTop+300;
                var imageHeight = $(".upload-mask").height();
                var imageMaxY = boxBottomTop-imageHeight;

                if(uploadTop>boxTop){
                  //上面超出
                  previewStyle.y = boxTop-30;
                }

                if(imageMaxY>previewStyle.y){
                  //从下面
                  previewStyle.y = imageMaxY-30;
                }
            $preview.css(transform, "translate3d(" + 0 + 'px,' + previewStyle.y + "px,0) rotate(" + previewStyle.rotate + "deg) scale(" + (previewStyle.scale / previewStyle.ratio) + ")");
        }
    })
    //选择图片
    $rotateBtn.on("click", function() {
        if (previewStyle.rotate == 360) {
            previewStyle.rotate = 0;
        } else {
            previewStyle.rotate += 90;
        }
        myCrop.setCropStyle(previewStyle)
        $preview.css(transform, "translate3d(" + previewStyle.x + 'px,' + previewStyle.y + "px,0) rotate(" + previewStyle.rotate + "deg) scale(" + (previewStyle.scale / previewStyle.ratio) + ")")
    })
    //获取图片并关闭弹窗返回到表单界面
    $getFile.on("click", function() {
        var src;
        $uploadPage.hide();
        myCrop.setCropStyle(previewStyle)
        //自定义getCropFile({type:"png",background:"red",lowDpi:true})
        src = myCrop.getCropFile({});
        $previewResult.attr("src", src)
        //you can upload new img file :cheers:)
        // console.info('拿到Base64了,传给后台吧？') //src.substr(22)
    })
    //上传文件按钮&&关闭弹窗按钮
    $(document).delegate("#file", "click", function() {
        $uploadPage.show();
    }).delegate("#closeCrop", "click", function() {
        $uploadPage.hide();
        resetUserOpts();
        myCrop.setCropStyle(previewStyle)
    })
    $file.one("click", function() {
        $uploadPage.show();
        $mask.prop({
            width: $mask.width(),
            height: $mask.height()
        })
        maskCtx.fillStyle = "rgba(0,0,0,0.7)";
        maskCtx.fillRect(0, 0, $mask.width(), $mask.height());
        maskCtx.fill();
        maskCtx.clearRect(($mask.width() - opts.cropWidth) / 2, ($mask.height() - opts.cropHeight) / 2, opts.cropWidth, opts.cropHeight)
    })
})
