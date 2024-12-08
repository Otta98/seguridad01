const chai = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');
const assert = chai.assert;

chai.use(chaiHttp);

suite('Functional Tests', function() {

  test('Viewing a stock and liking it', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body, ['stockData']);
        assert.isNumber(res.body.stockData[0].likes);
        done();
      });
  });

  test('Viewing the same stock and liking it again', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG&like=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body, ['stockData']);
        assert.isNumber(res.body.stockData[0].likes);
        done();
      });
  });

  test('Viewing two stocks', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG,AMZN')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body, ['stockData']);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        done();
      });
  });

  test('Viewing two stocks and liking them', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG,AMZN&like=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body, ['stockData']);
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
        assert.isNumber(res.body.stockData[0].likes);
        assert.isNumber(res.body.stockData[1].likes);
        done();
      });
  });

  test('Viewing a stock without liking it', function(done) {
    chai.request(server)
      .get('/api/stock-prices?stock=GOOG')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.hasAllKeys(res.body, ['stockData']);
        assert.isNumber(res.body.stockData[0].likes);
        done();
      });
  });

});
