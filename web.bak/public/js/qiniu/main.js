$(function() {
var uploader = Qiniu.uploader({
                runtimes: 'html5,html4',    //上传模式,依次退化
                browse_button: 'pickfiles',       //上传选择的点选按钮，**必需**
                uptoken_url: info && info.uptoken_url,            //Ajax请求upToken的Url，**强烈建议设置**（服务端提供）
                // uptoken : '', //若未指定uptoken_url,则必须指定 uptoken ,uptoken由其他程序生成
                unique_names: true, // 默认 false，key为文件名。若开启该选项，SDK为自动生成上传成功后的key（文件名）。
                // save_key: true,   // 默认 false。若在服务端生成uptoken的上传策略中指定了 `sava_key`，则开启，SDK会忽略对key的处理
               
                domain: info && info.domain,//bucket 域名，下载资源时用到，**必需**
                container: 'container',           //上传区域DOM ID，默认是browser_button的父元素，
                max_file_size: '100mb',           //最大文件体积限制
                flash_swf_url: 'js/plupload/Moxie.swf',  //引入flash,相对路径
                max_retries: 3,                   //上传失败最大重试次数
                dragdrop: false,                   //开启可拖曳上传
                drop_element: 'container',        //拖曳上传区域元素的ID，拖曳文件或文件夹后可触发上传
                chunk_size: '4mb',                //分块上传时，每片的体积
                auto_start: true,                 //选择文件后自动上传，若关闭需要自己绑定事件触发上传
                init: {              
                    'FilesAdded': function(up, files) {                     
                    },
                    'BeforeUpload': function(up, file) {
                          // 每个文件上传前,处理相关的事
                    },
                    'UploadProgress': function(up, file) {
                           // 每个文件上传时,处理相关的事情
                    },
                    'FileUploaded': function(up, file, info) {
                           // 每个文件上传成功后,处理相关的事情
                           // 其中 info 是文件上传成功后，服务端返回的json，形式如
                           // {
                           //    "hash": "Fh8xVqod2MQ1mocfI4S4KpRL6D98",
                           //    "key": "gogopher.jpg"
                           //  }
                           // 参考http://developer.qiniu.com/docs/v6/api/overview/up/response/simple-response.html

                            var domain = up.getOption('domain');
                            var res = JSON.parse(info);
                            var sourceLink = domain + res.key; //获取上传成功后的文件的Url
                            socket && socket.send(
                              {
                                c : 'upload',
                                data : { key : res.key }
                              }
                            )
                    },
                    'Error': function(up, err, errTip) {
                           //上传出错时,处理相关的事情
                           console.log(err);
                    },
                    'UploadComplete': function() {
                           //队列文件处理完毕后,处理相关的事情
                    }
                }
            });
});