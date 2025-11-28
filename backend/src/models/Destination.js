var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, } from 'typeorm';
import { Trip } from './Trip';
import { PlaceCategory } from '../types/enums';
let Destination = (() => {
    let _classDecorators = [Entity('destinations')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _tripId_decorators;
    let _tripId_initializers = [];
    let _tripId_extraInitializers = [];
    let _dayNumber_decorators;
    let _dayNumber_initializers = [];
    let _dayNumber_extraInitializers = [];
    let _name_decorators;
    let _name_initializers = [];
    let _name_extraInitializers = [];
    let _address_decorators;
    let _address_initializers = [];
    let _address_extraInitializers = [];
    let _latitude_decorators;
    let _latitude_initializers = [];
    let _latitude_extraInitializers = [];
    let _longitude_decorators;
    let _longitude_initializers = [];
    let _longitude_extraInitializers = [];
    let _placeId_decorators;
    let _placeId_initializers = [];
    let _placeId_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _notes_decorators;
    let _notes_initializers = [];
    let _notes_extraInitializers = [];
    let _estimatedDuration_decorators;
    let _estimatedDuration_initializers = [];
    let _estimatedDuration_extraInitializers = [];
    let _cost_decorators;
    let _cost_initializers = [];
    let _cost_extraInitializers = [];
    let _photos_decorators;
    let _photos_initializers = [];
    let _photos_extraInitializers = [];
    let _startTime_decorators;
    let _startTime_initializers = [];
    let _startTime_extraInitializers = [];
    let _endTime_decorators;
    let _endTime_initializers = [];
    let _endTime_extraInitializers = [];
    let _order_decorators;
    let _order_initializers = [];
    let _order_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _trip_decorators;
    let _trip_initializers = [];
    let _trip_extraInitializers = [];
    var Destination = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [PrimaryGeneratedColumn('uuid')];
            _tripId_decorators = [Column({ name: 'trip_id' })];
            _dayNumber_decorators = [Column({ name: 'day_number', type: 'int' })];
            _name_decorators = [Column()];
            _address_decorators = [Column()];
            _latitude_decorators = [Column({ type: 'decimal', precision: 10, scale: 7 })];
            _longitude_decorators = [Column({ type: 'decimal', precision: 10, scale: 7 })];
            _placeId_decorators = [Column({ name: 'place_id', nullable: true })];
            _category_decorators = [Column({
                    type: 'enum',
                    enum: PlaceCategory,
                    default: PlaceCategory.ATTRACTION,
                })];
            _notes_decorators = [Column({ type: 'text', nullable: true })];
            _estimatedDuration_decorators = [Column({ name: 'estimated_duration', type: 'int', nullable: true })];
            _cost_decorators = [Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })];
            _photos_decorators = [Column('simple-array', { nullable: true })];
            _startTime_decorators = [Column({ name: 'start_time', nullable: true })];
            _endTime_decorators = [Column({ name: 'end_time', nullable: true })];
            _order_decorators = [Column({ type: 'int', default: 0 })];
            _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
            _trip_decorators = [ManyToOne(() => Trip, (trip) => trip.destinations, { onDelete: 'CASCADE' }), JoinColumn({ name: 'trip_id' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _tripId_decorators, { kind: "field", name: "tripId", static: false, private: false, access: { has: obj => "tripId" in obj, get: obj => obj.tripId, set: (obj, value) => { obj.tripId = value; } }, metadata: _metadata }, _tripId_initializers, _tripId_extraInitializers);
            __esDecorate(null, null, _dayNumber_decorators, { kind: "field", name: "dayNumber", static: false, private: false, access: { has: obj => "dayNumber" in obj, get: obj => obj.dayNumber, set: (obj, value) => { obj.dayNumber = value; } }, metadata: _metadata }, _dayNumber_initializers, _dayNumber_extraInitializers);
            __esDecorate(null, null, _name_decorators, { kind: "field", name: "name", static: false, private: false, access: { has: obj => "name" in obj, get: obj => obj.name, set: (obj, value) => { obj.name = value; } }, metadata: _metadata }, _name_initializers, _name_extraInitializers);
            __esDecorate(null, null, _address_decorators, { kind: "field", name: "address", static: false, private: false, access: { has: obj => "address" in obj, get: obj => obj.address, set: (obj, value) => { obj.address = value; } }, metadata: _metadata }, _address_initializers, _address_extraInitializers);
            __esDecorate(null, null, _latitude_decorators, { kind: "field", name: "latitude", static: false, private: false, access: { has: obj => "latitude" in obj, get: obj => obj.latitude, set: (obj, value) => { obj.latitude = value; } }, metadata: _metadata }, _latitude_initializers, _latitude_extraInitializers);
            __esDecorate(null, null, _longitude_decorators, { kind: "field", name: "longitude", static: false, private: false, access: { has: obj => "longitude" in obj, get: obj => obj.longitude, set: (obj, value) => { obj.longitude = value; } }, metadata: _metadata }, _longitude_initializers, _longitude_extraInitializers);
            __esDecorate(null, null, _placeId_decorators, { kind: "field", name: "placeId", static: false, private: false, access: { has: obj => "placeId" in obj, get: obj => obj.placeId, set: (obj, value) => { obj.placeId = value; } }, metadata: _metadata }, _placeId_initializers, _placeId_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _notes_decorators, { kind: "field", name: "notes", static: false, private: false, access: { has: obj => "notes" in obj, get: obj => obj.notes, set: (obj, value) => { obj.notes = value; } }, metadata: _metadata }, _notes_initializers, _notes_extraInitializers);
            __esDecorate(null, null, _estimatedDuration_decorators, { kind: "field", name: "estimatedDuration", static: false, private: false, access: { has: obj => "estimatedDuration" in obj, get: obj => obj.estimatedDuration, set: (obj, value) => { obj.estimatedDuration = value; } }, metadata: _metadata }, _estimatedDuration_initializers, _estimatedDuration_extraInitializers);
            __esDecorate(null, null, _cost_decorators, { kind: "field", name: "cost", static: false, private: false, access: { has: obj => "cost" in obj, get: obj => obj.cost, set: (obj, value) => { obj.cost = value; } }, metadata: _metadata }, _cost_initializers, _cost_extraInitializers);
            __esDecorate(null, null, _photos_decorators, { kind: "field", name: "photos", static: false, private: false, access: { has: obj => "photos" in obj, get: obj => obj.photos, set: (obj, value) => { obj.photos = value; } }, metadata: _metadata }, _photos_initializers, _photos_extraInitializers);
            __esDecorate(null, null, _startTime_decorators, { kind: "field", name: "startTime", static: false, private: false, access: { has: obj => "startTime" in obj, get: obj => obj.startTime, set: (obj, value) => { obj.startTime = value; } }, metadata: _metadata }, _startTime_initializers, _startTime_extraInitializers);
            __esDecorate(null, null, _endTime_decorators, { kind: "field", name: "endTime", static: false, private: false, access: { has: obj => "endTime" in obj, get: obj => obj.endTime, set: (obj, value) => { obj.endTime = value; } }, metadata: _metadata }, _endTime_initializers, _endTime_extraInitializers);
            __esDecorate(null, null, _order_decorators, { kind: "field", name: "order", static: false, private: false, access: { has: obj => "order" in obj, get: obj => obj.order, set: (obj, value) => { obj.order = value; } }, metadata: _metadata }, _order_initializers, _order_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _trip_decorators, { kind: "field", name: "trip", static: false, private: false, access: { has: obj => "trip" in obj, get: obj => obj.trip, set: (obj, value) => { obj.trip = value; } }, metadata: _metadata }, _trip_initializers, _trip_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Destination = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        tripId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tripId_initializers, void 0));
        dayNumber = (__runInitializers(this, _tripId_extraInitializers), __runInitializers(this, _dayNumber_initializers, void 0));
        name = (__runInitializers(this, _dayNumber_extraInitializers), __runInitializers(this, _name_initializers, void 0));
        address = (__runInitializers(this, _name_extraInitializers), __runInitializers(this, _address_initializers, void 0));
        latitude = (__runInitializers(this, _address_extraInitializers), __runInitializers(this, _latitude_initializers, void 0));
        longitude = (__runInitializers(this, _latitude_extraInitializers), __runInitializers(this, _longitude_initializers, void 0));
        placeId = (__runInitializers(this, _longitude_extraInitializers), __runInitializers(this, _placeId_initializers, void 0));
        category = (__runInitializers(this, _placeId_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        notes = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _notes_initializers, void 0));
        estimatedDuration = (__runInitializers(this, _notes_extraInitializers), __runInitializers(this, _estimatedDuration_initializers, void 0));
        cost = (__runInitializers(this, _estimatedDuration_extraInitializers), __runInitializers(this, _cost_initializers, void 0));
        photos = (__runInitializers(this, _cost_extraInitializers), __runInitializers(this, _photos_initializers, void 0));
        startTime = (__runInitializers(this, _photos_extraInitializers), __runInitializers(this, _startTime_initializers, void 0));
        endTime = (__runInitializers(this, _startTime_extraInitializers), __runInitializers(this, _endTime_initializers, void 0));
        order = (__runInitializers(this, _endTime_extraInitializers), __runInitializers(this, _order_initializers, void 0));
        createdAt = (__runInitializers(this, _order_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        trip = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _trip_initializers, void 0));
        constructor() {
            __runInitializers(this, _trip_extraInitializers);
        }
    };
    return Destination = _classThis;
})();
export { Destination };
