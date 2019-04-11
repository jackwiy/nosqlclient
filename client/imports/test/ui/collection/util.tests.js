/* eslint-env mocha */

import sinon from 'sinon';
import { expect } from 'chai';
import { CollectionUtil, Connection } from '/client/imports/ui';
import { Enums, ErrorHandler, Notification, SessionManager } from '/client/imports/modules';
import { Communicator } from '/client/imports/facades';
import $ from 'jquery';

describe('CollectionUtil', () => {
  describe('setSessionForNavigation tests', () => {
    beforeEach(() => {
      sinon.stub(SessionManager, 'set');
    });

    afterEach(() => {
      SessionManager.set.restore();

      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('setSessionForNavigation with name exist', () => {
      // prepare
      const selectedName = 'Sercan';
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.setSessionForNavigation(selectedName);

      // verify
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, selectedName)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(true);
      expect($('#tugce').hasClass('active')).to.equal(false);
    });

    it('setSessionForNavigation with name not exist', () => {
      // prepare
      const selectedName = 'not_exist';
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.setSessionForNavigation(selectedName);

      // verify
      expect(SessionManager.set.callCount).to.equal(1);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, selectedName)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(false);
      expect($('#tugce').hasClass('active')).to.equal(false);
    });
  });

  describe('dropDatabase tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(SessionManager, 'clear');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      SessionManager.clear.restore();
      Notification.success.restore();
    });

    it('dropDatabase & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('database-dropped-successfully')).to.equal(true);
      expect(SessionManager.clear.callCount).to.equal(1);
      expect(SessionManager.clear.calledWithExactly()).to.equal(true);
    });
  });

  describe('dropDatabase tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(SessionManager, 'clear');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      SessionManager.clear.restore();
      Notification.success.restore();
    });

    it('dropDatabase & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(SessionManager.clear.callCount).to.equal(0);
    });

    it('dropDatabase & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropDatabase();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'recover-not-possible',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropDB',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('database-dropped-successfully')).to.equal(true);
      expect(SessionManager.clear.callCount).to.equal(1);
      expect(SessionManager.clear.calledWithExactly()).to.equal(true);
    });
  });

  describe('dropAllCollections tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.success.restore();
    });

    it('dropAllCollections & no confirmation', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to error', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to error (1)', () => {
      // prepare
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropAllCollections & confirmation & communicator yields to success', () => {
      // prepare
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropAllCollections();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'all-collections-will-be-dropped',
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropAllCollections',
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('dropped-all-collections-successfully')).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(false)).to.equal(true);
    });
  });

  describe('dropCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.success.restore();
    });

    it('dropCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropCollection & no confirmation', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
    });

    it('dropCollection & confirmation & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.dropCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-dropped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'dropCollection',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-dropped-successfully', null, { selectedCollection })).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(false)).to.equal(true);
    });
  });

  describe('cloneCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Connection, 'connect');
      sinon.stub(Notification, 'closeModal');
      sinon.stub(Notification, 'showModalInputError');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Connection.connect.restore();
      Notification.closeModal.restore();
      Notification.showModalInputError.restore();
    });

    it('cloneCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.cloneCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('cloneCollection & no input', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal').yieldsTo('callback');

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(1);
      expect(Notification.showModalInputError.calledWithExactly('name-required')).to.equal(true);
    });

    it('cloneCollection & input & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.closeModal.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });

    it('cloneCollection & input & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.closeModal.callCount).to.equal(0);
      expect(Connection.connect.callCount).to.equal(0);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });

    it('cloneCollection & input & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      const input = 'tugce';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').onCall(0).yieldsTo('callback', input);

      // execute
      CollectionUtil.cloneCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(2);
      expect(Notification.modal.calledWithMatch({
        title: 'collection_name',
        text: 'collection_name',
        type: 'input',
        closeOnConfirm: false,
        inputPlaceholder: 'collection_name',
        inputValue: selectedCollection,
        callback: sinon.match.func
      })).to.equal(true);
      expect(Notification.modal.calledWithMatch({ title: 'creating', text: 'please-wait', type: 'info' })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'aggregate',
        args: { selectedCollection, pipeline: [{ $match: {} }, { $out: input }] },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.closeModal.callCount).to.equal(1);
      expect(Notification.closeModal.calledWithExactly()).to.equal(true);
      expect(Connection.connect.callCount).to.equal(1);
      expect(Connection.connect.calledWithExactly(true, 'collection-cloned-successfully', { selectedCollection, name: input })).to.equal(true);
      expect(Notification.showModalInputError.callCount).to.equal(0);
    });
  });

  describe('showMongoBinaryInfo tests', () => {
    beforeEach(() => {
      sinon.stub(localStorage, 'setItem');
    });

    afterEach(() => {
      Notification.modal.restore();
      localStorage.setItem.restore();
      localStorage.getItem.restore();
    });

    it('showMongoBinaryInfo & localstorage item exist', () => {
      // prepare
      sinon.spy(Notification, 'modal');
      sinon.stub(localStorage, 'getItem').returns(true);

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(localStorage.setItem.callCount).to.equal(0);
    });

    it('showMongoBinaryInfo & localstorage item does not exist & no confirmation', () => {
      // prepare
      sinon.stub(Notification, 'modal').yieldsTo('callback', false);
      sinon.stub(localStorage, 'getItem').returns();

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'mongo-tools',
        text: 'mongo-tools-info',
        type: 'info',
        confirmButtonText: 'dont_show_again',
        callback: sinon.match.func
      })).to.equal(true);
      expect(localStorage.setItem.callCount).to.equal(0);
    });

    it('showMongoBinaryInfo & localstorage item does not exist & confirmation', () => {
      // prepare
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);
      sinon.stub(localStorage, 'getItem').returns();

      // execute
      CollectionUtil.showMongoBinaryInfo();

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'mongo-tools',
        text: 'mongo-tools-info',
        type: 'info',
        confirmButtonText: 'dont_show_again',
        callback: sinon.match.func
      })).to.equal(true);
      expect(localStorage.setItem.callCount).to.equal(1);
      expect(localStorage.setItem.calledWithExactly(Enums.LOCAL_STORAGE_KEYS.MONGO_BINARY_INFO, 'true')).to.equal(true);
    });
  });

  describe('clearCollection tests', () => {
    beforeEach(() => {
      sinon.stub(ErrorHandler, 'showMeteorFuncError');
      sinon.stub(Notification, 'success');
    });

    afterEach(() => {
      Notification.modal.restore();
      Communicator.call.restore();
      ErrorHandler.showMeteorFuncError.restore();
      Notification.success.restore();
    });

    it('clearCollection & invalid param', () => {
      // prepare
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.clearCollection();

      // verify
      expect(Notification.modal.callCount).to.equal(0);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('clearCollection & no confirmation', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.spy(Communicator, 'call');
      sinon.stub(Notification, 'modal');

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to error', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', error, null);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(error, null)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to error (1)', () => {
      // prepare
      const selectedCollection = 'sercan';
      const error = { error: '1233' };
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, error);
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(1);
      expect(ErrorHandler.showMeteorFuncError.calledWithExactly(null, error)).to.equal(true);
      expect(Notification.success.callCount).to.equal(0);
    });

    it('clearCollection & confirmation & communicator yields to success', () => {
      // prepare
      const selectedCollection = 'sercan';
      sinon.stub(Communicator, 'call').yieldsTo('callback', null, {});
      sinon.stub(Notification, 'modal').yieldsTo('callback', true);

      // execute
      CollectionUtil.clearCollection(selectedCollection);

      // verify
      expect(Notification.modal.callCount).to.equal(1);
      expect(Notification.modal.calledWithMatch({
        title: 'are-you-sure',
        text: 'collection-will-be-wiped',
        textTranslateOptions: { selectedCollection },
        type: 'warning',
        callback: sinon.match.func
      })).to.equal(true);
      expect(Communicator.call.callCount).to.equal(1);
      expect(Communicator.call.calledWithMatch({
        methodName: 'delete',
        args: { selectedCollection },
        callback: sinon.match.func
      })).to.equal(true);
      expect(ErrorHandler.showMeteorFuncError.callCount).to.equal(0);
      expect(Notification.success.callCount).to.equal(1);
      expect(Notification.success.calledWithExactly('collection-cleared-successfully', null, { selectedCollection })).to.equal(true);
    });
  });

  describe('handleNavigationAndSessions tests', () => {
    let valStub;
    beforeEach(() => {
      valStub = {
        trigger: sinon.stub()
      };
      sinon.stub(SessionManager, 'set');
      sinon.stub($.prototype, 'val').returns(valStub);
    });

    afterEach(() => {
      SessionManager.set.restore();
      $.prototype.val.restore();

      while (document.body.firstChild) {
        document.body.removeChild(document.body.firstChild);
      }
    });

    it('handleNavigationAndSessions', () => {
      // prepare
      const ulCollectionNames = $('<ul id="listCollectionNames" class="nav nav-second-level">'
        + '<li id="sercan">Sercan</li>'
        + '<li class="active" id="tugce">Tugce</li>'
        + '</ul>'
        + '<ul id="listSystemCollections" class="nav nav-second-level">'
        + '<li class="active" id="1">1</li>'
        + '<li class="active" id="2">2</li>'
        + '</ul>');
      $('body').append(ulCollectionNames);

      // execute
      CollectionUtil.handleNavigationAndSessions();

      // verify
      expect(SessionManager.set.callCount).to.equal(3);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedCollection, null)).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedQuery, null)).to.equal(true);
      expect(SessionManager.set.calledWithExactly(SessionManager.strSessionSelectedOptions, null)).to.equal(true);
      expect($('#sercan').hasClass('active')).to.equal(false);
      expect($('#1').hasClass('active')).to.equal(false);
      expect($('#2').hasClass('active')).to.equal(false);
      expect($('#tugce').hasClass('active')).to.equal(false);
      expect($.prototype.val.callCount).to.equal(2);
      expect($.prototype.val.getCall(0).thisValue.selector).to.equal('#cmbQueries');
      expect($.prototype.val.getCall(1).thisValue.selector).to.equal('#cmbAdminQueries');
      expect($.prototype.val.alwaysCalledWithExactly('')).to.equal(true);
      expect(valStub.trigger.callCount).to.equal(2);
      expect(valStub.trigger.alwaysCalledWithExactly('chosen:updated')).to.equal(true);
    });
  });

  describe('prepareContextMenuItems tests', () => {
    const collectionName = 'sercanCol';

    beforeEach(() => {
      sinon.stub($.prototype, 'find').returns({
        context: {
          innerText: collectionName
        }
      });
    });

    afterEach(() => {
      $.prototype.find.restore();
    });

    it('prepareContextMenuItems item existance', () => {
      // prepare

      // execute
      const items = CollectionUtil.prepareContextMenuItems({});

      // verify
      expect(items).to.have.property('manage_collection');
      expect(items).to.have.property('update_view_pipeline');
      expect(items).to.have.property('add_collection');
      expect(items).to.have.property('filter_collections');
      expect(items).to.have.property('clear_filter');
      expect(items).to.have.property('refresh_collections');
      expect(items).to.have.property('drop_collection');
      expect(items).to.have.property('drop_collections');
      expect(items.manage_collection.items).to.have.property('view_collection');
      expect(items.manage_collection.items).to.have.property('convert_to_capped');
      expect(items.manage_collection.items).to.have.property('rename_collection');
      expect(items.manage_collection.items).to.have.property('clone_collection');
      expect(items.manage_collection.items).to.have.property('validation_rules');
      expect(items.manage_collection.items).to.have.property('clear_collection');
    });

    it('prepareContextMenuItems manage_collection.view_collection callback', () => {
      // prepare
      const addCollectionModal = {
        data: sinon.stub(),
        modal: sinon.stub()
      };

      $(`<a class="navCollection">${collectionName}</a>`);

      // execute
      const items = CollectionUtil.prepareContextMenuItems({ addCollectionModal });
      items.manage_collection.items.view_collection.callback.call();

      // verify
      expect(addCollectionModal.data.callCount).to.equal(1);
      expect(addCollectionModal.data.calledWithExactly('is-view', collectionName)).to.equal(true);
      expect(addCollectionModal.modal.callCount).to.equal(1);
      expect(addCollectionModal.modal.calledWithMatch({ backdrop: 'static', keyboard: false, })).to.equal(true);
    });
  });
});