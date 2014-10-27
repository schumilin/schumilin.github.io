;(function(angular) {
  'use strict';
  
  angular
    .module('airpub')
    .controller('single', [
      '$scope', '$state', '$duoshuo', '$rootScope', 
      singleArticleCtrler
    ]);

  function singleArticleCtrler($scope, $state, $duoshuo, $rootScope) {
    var uri = $state.params.uri;
    if (!uri) return $state.go('layout.404');
    $scope.articleID = uri;
    // Read from cache
    if ($scope.article) return;
    // Fetch article details
    $duoshuo.get('threads/details', {
      thread_id: uri
    }, function(err, result) {
      if (err)
        return $scope.addAlert('文章内容获取失败，请稍后再试...', 'danger');
      $scope.article = result;

      $rootScope.$emit('updateMeta', {
        title: result.title,
        description: fetchDesciption(result.content)
      });

      if (result.meta && result.meta.background)
        $scope.updateBackground(result.meta.background);

      if ($scope.article)
        initWeixinShare($scope.article)

      if (!result.author_id) return;
      // Fetch authors' profile
      $duoshuo.get('users/profile', {
        user_id: result.author_id
      }, function(err, result) {
        if (err) return; // ignore null profile
        $scope.author = result;
        $scope.author.description = result.connected_services.weibo ?
          result.connected_services.weibo.description :
          null;
      });
    }, function(err) {
      return $state.go('layout.404');
    });
  }

  function fetchDesciption(text) {
    var maxLength = 80;
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + '...';
  }

  function initWeixinShare(article) {
    if (!window.wechat)
      return;

    var wechat = window.wechat;
    var limit = 42;
    var data = {};

    data.link = article.url;
    data.title = article.title;
    data.desc = article.content.substr(0, limit) + ( article.content.length > limit ? '...' : '');

    if (article.meta && article.meta.background)
      data.img = article.meta.background;

    wechat('friend', data);
    wechat('timeline', data);
    wechat('weibo', data);
  }
})(window.angular);
