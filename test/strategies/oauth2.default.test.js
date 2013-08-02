var chai = require('chai')
  , OAuth2Strategy = require('../../lib/strategies/oauth2');


describe('OAuth2Strategy with default options', function() {
    
  var strategy = new OAuth2Strategy({
      authorizationURL: 'https://www.example.com/oauth2/authorize',
      tokenURL: 'https://www.example.com/oauth2/token',
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: 'https://www.example.net/auth/example/callback',
    },
    function(accessToken, refreshToken, profile, done) {
      if (accessToken == '2YotnFZFEjr1zCsicMWpAA' && refreshToken == 'tGzv3JOkF0XG5Qx2TlKWIA' && Object.keys(profile).length == 0) { 
        return done(null, { id: '1234' }, { message: 'Hello' });
      } else if (accessToken == 'one-2YotnFZFEjr1zCsicMWpAA' && refreshToken == 'one-tGzv3JOkF0XG5Qx2TlKWIA' && Object.keys(profile).length == 0) { 
        return done(null, { id: 'one' }, { message: 'Hello' });
      } else if (accessToken == 'two-2YotnFZFEjr1zCsicMWpAA' && refreshToken == 'two-tGzv3JOkF0XG5Qx2TlKWIA' && Object.keys(profile).length == 0) { 
        return done(null, { id: 'two' }, { message: 'Hello' });
      }
      return done(null, false);
    });
  
  // inject a "mock" oauth2 instance
  strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
    if (code == 'SplxlOBeZQQYbYS6WxSbIA' && options.grant_type == 'authorization_code') {
      if (options.redirect_uri == 'https://www.example.net/auth/example/callback') {
        return callback(null, '2YotnFZFEjr1zCsicMWpAA', 'tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
      } else if (options.redirect_uri == 'https://www.example.net/auth/example/one-callback') {
        return callback(null, 'one-2YotnFZFEjr1zCsicMWpAA', 'one-tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
      } else if (options.redirect_uri == 'https://www.example.net/auth/example/two-callback') {
        return callback(null, 'two-2YotnFZFEjr1zCsicMWpAA', 'two-tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
      }
    } else {
      return callback(null, 'wrong-access-token', 'wrong-refresh-token');
    }
  }
  
  describe('handling an authorized return request', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
        })
        .authenticate();
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Hello');
    });
  });
  
  describe('handling an authorized return request with callbackURL option override', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
        })
        .authenticate({ callbackURL: 'https://www.example.net/auth/example/one-callback' });
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('one');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Hello');
    });
  });
  
  describe('handling an authorized return request with a relative callbackURL option override', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example/two-callback';
          req.headers.host = 'www.example.net';
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
          req.connection = { encrypted: true };
        })
        .authenticate({ callbackURL: '/auth/example/two-callback' });
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('two');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Hello');
    });
  });
  
  describe('handling a request to be redirected for authorization', function() {
    var url;
  
    before(function(done) {
      chai.passport(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate();
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.example.com/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fwww.example.net%2Fauth%2Fexample%2Fcallback&client_id=ABC123&type=web_server');
    });
  });
  
  describe('handling a request to be redirected for authorization with callbackURL option override', function() {
    var url;
  
    before(function(done) {
      chai.passport(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
        })
        .authenticate({ callbackURL: 'https://www.example.net/auth/example/one-callback' });
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.example.com/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fwww.example.net%2Fauth%2Fexample%2Fone-callback&client_id=ABC123&type=web_server');
    });
  });
  
});


describe('OAuth2Strategy with default options using relative callback URL', function() {
    
  var strategy = new OAuth2Strategy({
      authorizationURL: 'https://www.example.com/oauth2/authorize',
      tokenURL: 'https://www.example.com/oauth2/token',
      clientID: 'ABC123',
      clientSecret: 'secret',
      callbackURL: '/auth/example/callback',
    },
    function(accessToken, refreshToken, profile, done) {
      if (accessToken == '2YotnFZFEjr1zCsicMWpAA' && refreshToken == 'tGzv3JOkF0XG5Qx2TlKWIA' && Object.keys(profile).length == 0) { 
        return done(null, { id: '1234' }, { message: 'Hello' });
      } else if (accessToken == 'insecure-2YotnFZFEjr1zCsicMWpAA' && refreshToken == 'insecure-tGzv3JOkF0XG5Qx2TlKWIA' && Object.keys(profile).length == 0) { 
        return done(null, { id: '1234' }, { message: 'Insecure Hello' });
      }
      return done(null, false);
    });
  
  // inject a "mock" oauth2 instance
  strategy._oauth2.getOAuthAccessToken = function(code, options, callback) {
    if (code == 'SplxlOBeZQQYbYS6WxSbIA' && options.grant_type == 'authorization_code' &&
        options.redirect_uri == 'https://www.example.net/auth/example/callback') {
      return callback(null, '2YotnFZFEjr1zCsicMWpAA', 'tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
    } else if (code == 'SplxlOBeZQQYbYS6WxSbIA' && options.grant_type == 'authorization_code' &&
        options.redirect_uri == 'http://www.example.net/auth/example/callback') {
      return callback(null, 'insecure-2YotnFZFEjr1zCsicMWpAA', 'insecure-tGzv3JOkF0XG5Qx2TlKWIA', { token_type: 'example', expires_in: 3600, example_parameter: 'example_value' });
    } else {
      return callback(null, 'wrong-access-token', 'wrong-refresh-token');
    }
  }
  
  describe('handling an authorized return request on secure connection', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example';
          req.headers.host = 'www.example.net';
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
          req.connection = { encrypted: true };
        })
        .authenticate();
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Hello');
    });
  });
  
  describe('handling an authorized return request on insecure connection', function() {
    var user
      , info;
  
    before(function(done) {
      chai.passport(strategy)
        .success(function(u, i) {
          user = u;
          info = i;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example';
          req.headers.host = 'www.example.net';
          req.query = {};
          req.query.code = 'SplxlOBeZQQYbYS6WxSbIA';
          req.connection = {};
        })
        .authenticate();
    });
  
    it('should supply user', function() {
      expect(user).to.be.an.object;
      expect(user.id).to.equal('1234');
    });
  
    it('should supply info', function() {
      expect(info).to.be.an.object;
      expect(info.message).to.equal('Insecure Hello');
    });
  });
  
  describe('handling a request on secure connection to be redirected for authorization', function() {
    var url;
  
    before(function(done) {
      chai.passport(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example';
          req.headers.host = 'www.example.net';
          req.connection = { encrypted: true };
        })
        .authenticate();
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.example.com/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fwww.example.net%2Fauth%2Fexample%2Fcallback&client_id=ABC123&type=web_server');
    });
  });
  
  describe('handling a request on insecure connection to be redirected for authorization', function() {
    var url;
  
    before(function(done) {
      chai.passport(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example';
          req.headers.host = 'www.example.net';
          req.connection = {};
        })
        .authenticate();
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.example.com/oauth2/authorize?response_type=code&redirect_uri=http%3A%2F%2Fwww.example.net%2Fauth%2Fexample%2Fcallback&client_id=ABC123&type=web_server');
    });
  });
  
  describe('handling a request from behind a proxy to be redirected for authorization', function() {
    var url;
  
    before(function(done) {
      chai.passport(strategy)
        .redirect(function(u) {
          url = u;
          done();
        })
        .req(function(req) {
          req.url = '/auth/example';
          req.headers.host = 'www.example.net';
          req.headers['x-forwarded-proto'] = 'https';
          req.connection = {};
        })
        .authenticate();
    });
  
    it('should be redirected', function() {
      expect(url).to.equal('https://www.example.com/oauth2/authorize?response_type=code&redirect_uri=https%3A%2F%2Fwww.example.net%2Fauth%2Fexample%2Fcallback&client_id=ABC123&type=web_server');
    });
  });
  
});