process.env.NODE_ENV = 'test';

import chai from 'chai';
import chaiHttp from 'chai-http';

import server from '../index';
let should = chai.should();

chai.use(chaiHttp);
describe('Test Server running',()=>{
    it('Server should run',(done)=>{
        chai.request(server)
        .get('/check')
        .set('API_KEY','123456a@')
        .end((err,res)=>{
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('data');
            res.body.data.should.have.property('status').eql('Running');
            res.body.data.should.have.property('databaseConnection').eql('Success');
            done();
        })
    })
})