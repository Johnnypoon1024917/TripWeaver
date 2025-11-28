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
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn, } from 'typeorm';
import { Trip } from './Trip';
import { Expense } from './Expense';
import { BudgetCategory } from '../types/enums';
let Budget = (() => {
    let _classDecorators = [Entity('budgets')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _tripId_decorators;
    let _tripId_initializers = [];
    let _tripId_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _spent_decorators;
    let _spent_initializers = [];
    let _spent_extraInitializers = [];
    let _currency_decorators;
    let _currency_initializers = [];
    let _currency_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _trip_decorators;
    let _trip_initializers = [];
    let _trip_extraInitializers = [];
    let _expenses_decorators;
    let _expenses_initializers = [];
    let _expenses_extraInitializers = [];
    var Budget = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [PrimaryGeneratedColumn('uuid')];
            _tripId_decorators = [Column({ name: 'trip_id' })];
            _category_decorators = [Column({
                    type: 'enum',
                    enum: BudgetCategory,
                })];
            _amount_decorators = [Column({ type: 'decimal', precision: 10, scale: 2 })];
            _spent_decorators = [Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })];
            _currency_decorators = [Column({ length: 3, default: 'USD' })];
            _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
            _trip_decorators = [ManyToOne(() => Trip, (trip) => trip.budgets, { onDelete: 'CASCADE' }), JoinColumn({ name: 'trip_id' })];
            _expenses_decorators = [OneToMany(() => Expense, (expense) => expense.budget)];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _tripId_decorators, { kind: "field", name: "tripId", static: false, private: false, access: { has: obj => "tripId" in obj, get: obj => obj.tripId, set: (obj, value) => { obj.tripId = value; } }, metadata: _metadata }, _tripId_initializers, _tripId_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _spent_decorators, { kind: "field", name: "spent", static: false, private: false, access: { has: obj => "spent" in obj, get: obj => obj.spent, set: (obj, value) => { obj.spent = value; } }, metadata: _metadata }, _spent_initializers, _spent_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: obj => "currency" in obj, get: obj => obj.currency, set: (obj, value) => { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _trip_decorators, { kind: "field", name: "trip", static: false, private: false, access: { has: obj => "trip" in obj, get: obj => obj.trip, set: (obj, value) => { obj.trip = value; } }, metadata: _metadata }, _trip_initializers, _trip_extraInitializers);
            __esDecorate(null, null, _expenses_decorators, { kind: "field", name: "expenses", static: false, private: false, access: { has: obj => "expenses" in obj, get: obj => obj.expenses, set: (obj, value) => { obj.expenses = value; } }, metadata: _metadata }, _expenses_initializers, _expenses_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Budget = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        tripId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tripId_initializers, void 0));
        category = (__runInitializers(this, _tripId_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        amount = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        spent = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _spent_initializers, void 0));
        currency = (__runInitializers(this, _spent_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
        createdAt = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        trip = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _trip_initializers, void 0));
        expenses = (__runInitializers(this, _trip_extraInitializers), __runInitializers(this, _expenses_initializers, void 0));
        constructor() {
            __runInitializers(this, _expenses_extraInitializers);
        }
    };
    return Budget = _classThis;
})();
export { Budget };
