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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn, } from 'typeorm';
import { User } from './User';
import { Destination } from './Destination';
import { Budget } from './Budget';
let Trip = (() => {
    let _classDecorators = [Entity('trips')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _userId_decorators;
    let _userId_initializers = [];
    let _userId_extraInitializers = [];
    let _title_decorators;
    let _title_initializers = [];
    let _title_extraInitializers = [];
    let _destination_decorators;
    let _destination_initializers = [];
    let _destination_extraInitializers = [];
    let _startDate_decorators;
    let _startDate_initializers = [];
    let _startDate_extraInitializers = [];
    let _endDate_decorators;
    let _endDate_initializers = [];
    let _endDate_extraInitializers = [];
    let _coverImage_decorators;
    let _coverImage_initializers = [];
    let _coverImage_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _collaborators_decorators;
    let _collaborators_initializers = [];
    let _collaborators_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _updatedAt_decorators;
    let _updatedAt_initializers = [];
    let _updatedAt_extraInitializers = [];
    let _user_decorators;
    let _user_initializers = [];
    let _user_extraInitializers = [];
    let _destinations_decorators;
    let _destinations_initializers = [];
    let _destinations_extraInitializers = [];
    let _budgets_decorators;
    let _budgets_initializers = [];
    let _budgets_extraInitializers = [];
    var Trip = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [PrimaryGeneratedColumn('uuid')];
            _userId_decorators = [Column({ name: 'user_id' })];
            _title_decorators = [Column()];
            _destination_decorators = [Column()];
            _startDate_decorators = [Column({ name: 'start_date', type: 'date' })];
            _endDate_decorators = [Column({ name: 'end_date', type: 'date' })];
            _coverImage_decorators = [Column({ name: 'cover_image', nullable: true })];
            _description_decorators = [Column({ type: 'text', nullable: true })];
            _collaborators_decorators = [Column('simple-array', { default: '' })];
            _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
            _updatedAt_decorators = [UpdateDateColumn({ name: 'updated_at' })];
            _user_decorators = [ManyToOne(() => User, (user) => user.trips, { onDelete: 'CASCADE' }), JoinColumn({ name: 'user_id' })];
            _destinations_decorators = [OneToMany(() => Destination, (destination) => destination.trip)];
            _budgets_decorators = [OneToMany(() => Budget, (budget) => budget.trip)];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _userId_decorators, { kind: "field", name: "userId", static: false, private: false, access: { has: obj => "userId" in obj, get: obj => obj.userId, set: (obj, value) => { obj.userId = value; } }, metadata: _metadata }, _userId_initializers, _userId_extraInitializers);
            __esDecorate(null, null, _title_decorators, { kind: "field", name: "title", static: false, private: false, access: { has: obj => "title" in obj, get: obj => obj.title, set: (obj, value) => { obj.title = value; } }, metadata: _metadata }, _title_initializers, _title_extraInitializers);
            __esDecorate(null, null, _destination_decorators, { kind: "field", name: "destination", static: false, private: false, access: { has: obj => "destination" in obj, get: obj => obj.destination, set: (obj, value) => { obj.destination = value; } }, metadata: _metadata }, _destination_initializers, _destination_extraInitializers);
            __esDecorate(null, null, _startDate_decorators, { kind: "field", name: "startDate", static: false, private: false, access: { has: obj => "startDate" in obj, get: obj => obj.startDate, set: (obj, value) => { obj.startDate = value; } }, metadata: _metadata }, _startDate_initializers, _startDate_extraInitializers);
            __esDecorate(null, null, _endDate_decorators, { kind: "field", name: "endDate", static: false, private: false, access: { has: obj => "endDate" in obj, get: obj => obj.endDate, set: (obj, value) => { obj.endDate = value; } }, metadata: _metadata }, _endDate_initializers, _endDate_extraInitializers);
            __esDecorate(null, null, _coverImage_decorators, { kind: "field", name: "coverImage", static: false, private: false, access: { has: obj => "coverImage" in obj, get: obj => obj.coverImage, set: (obj, value) => { obj.coverImage = value; } }, metadata: _metadata }, _coverImage_initializers, _coverImage_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _collaborators_decorators, { kind: "field", name: "collaborators", static: false, private: false, access: { has: obj => "collaborators" in obj, get: obj => obj.collaborators, set: (obj, value) => { obj.collaborators = value; } }, metadata: _metadata }, _collaborators_initializers, _collaborators_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _updatedAt_decorators, { kind: "field", name: "updatedAt", static: false, private: false, access: { has: obj => "updatedAt" in obj, get: obj => obj.updatedAt, set: (obj, value) => { obj.updatedAt = value; } }, metadata: _metadata }, _updatedAt_initializers, _updatedAt_extraInitializers);
            __esDecorate(null, null, _user_decorators, { kind: "field", name: "user", static: false, private: false, access: { has: obj => "user" in obj, get: obj => obj.user, set: (obj, value) => { obj.user = value; } }, metadata: _metadata }, _user_initializers, _user_extraInitializers);
            __esDecorate(null, null, _destinations_decorators, { kind: "field", name: "destinations", static: false, private: false, access: { has: obj => "destinations" in obj, get: obj => obj.destinations, set: (obj, value) => { obj.destinations = value; } }, metadata: _metadata }, _destinations_initializers, _destinations_extraInitializers);
            __esDecorate(null, null, _budgets_decorators, { kind: "field", name: "budgets", static: false, private: false, access: { has: obj => "budgets" in obj, get: obj => obj.budgets, set: (obj, value) => { obj.budgets = value; } }, metadata: _metadata }, _budgets_initializers, _budgets_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Trip = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        userId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _userId_initializers, void 0));
        title = (__runInitializers(this, _userId_extraInitializers), __runInitializers(this, _title_initializers, void 0));
        destination = (__runInitializers(this, _title_extraInitializers), __runInitializers(this, _destination_initializers, void 0));
        startDate = (__runInitializers(this, _destination_extraInitializers), __runInitializers(this, _startDate_initializers, void 0));
        endDate = (__runInitializers(this, _startDate_extraInitializers), __runInitializers(this, _endDate_initializers, void 0));
        coverImage = (__runInitializers(this, _endDate_extraInitializers), __runInitializers(this, _coverImage_initializers, void 0));
        description = (__runInitializers(this, _coverImage_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        collaborators = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _collaborators_initializers, void 0));
        createdAt = (__runInitializers(this, _collaborators_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        updatedAt = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _updatedAt_initializers, void 0));
        user = (__runInitializers(this, _updatedAt_extraInitializers), __runInitializers(this, _user_initializers, void 0));
        destinations = (__runInitializers(this, _user_extraInitializers), __runInitializers(this, _destinations_initializers, void 0));
        budgets = (__runInitializers(this, _destinations_extraInitializers), __runInitializers(this, _budgets_initializers, void 0));
        constructor() {
            __runInitializers(this, _budgets_extraInitializers);
        }
    };
    return Trip = _classThis;
})();
export { Trip };
