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
import { Budget } from './Budget';
let Expense = (() => {
    let _classDecorators = [Entity('expenses')];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _id_decorators;
    let _id_initializers = [];
    let _id_extraInitializers = [];
    let _tripId_decorators;
    let _tripId_initializers = [];
    let _tripId_extraInitializers = [];
    let _budgetId_decorators;
    let _budgetId_initializers = [];
    let _budgetId_extraInitializers = [];
    let _category_decorators;
    let _category_initializers = [];
    let _category_extraInitializers = [];
    let _amount_decorators;
    let _amount_initializers = [];
    let _amount_extraInitializers = [];
    let _currency_decorators;
    let _currency_initializers = [];
    let _currency_extraInitializers = [];
    let _description_decorators;
    let _description_initializers = [];
    let _description_extraInitializers = [];
    let _date_decorators;
    let _date_initializers = [];
    let _date_extraInitializers = [];
    let _paidBy_decorators;
    let _paidBy_initializers = [];
    let _paidBy_extraInitializers = [];
    let _splitWith_decorators;
    let _splitWith_initializers = [];
    let _splitWith_extraInitializers = [];
    let _createdAt_decorators;
    let _createdAt_initializers = [];
    let _createdAt_extraInitializers = [];
    let _trip_decorators;
    let _trip_initializers = [];
    let _trip_extraInitializers = [];
    let _budget_decorators;
    let _budget_initializers = [];
    let _budget_extraInitializers = [];
    var Expense = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            _id_decorators = [PrimaryGeneratedColumn('uuid')];
            _tripId_decorators = [Column({ name: 'trip_id' })];
            _budgetId_decorators = [Column({ name: 'budget_id' })];
            _category_decorators = [Column()];
            _amount_decorators = [Column({ type: 'decimal', precision: 10, scale: 2 })];
            _currency_decorators = [Column({ length: 3, default: 'USD' })];
            _description_decorators = [Column()];
            _date_decorators = [Column({ type: 'date' })];
            _paidBy_decorators = [Column({ name: 'paid_by' })];
            _splitWith_decorators = [Column('simple-array', { name: 'split_with', nullable: true })];
            _createdAt_decorators = [CreateDateColumn({ name: 'created_at' })];
            _trip_decorators = [ManyToOne(() => Trip, { onDelete: 'CASCADE' }), JoinColumn({ name: 'trip_id' })];
            _budget_decorators = [ManyToOne(() => Budget, (budget) => budget.expenses, { onDelete: 'CASCADE' }), JoinColumn({ name: 'budget_id' })];
            __esDecorate(null, null, _id_decorators, { kind: "field", name: "id", static: false, private: false, access: { has: obj => "id" in obj, get: obj => obj.id, set: (obj, value) => { obj.id = value; } }, metadata: _metadata }, _id_initializers, _id_extraInitializers);
            __esDecorate(null, null, _tripId_decorators, { kind: "field", name: "tripId", static: false, private: false, access: { has: obj => "tripId" in obj, get: obj => obj.tripId, set: (obj, value) => { obj.tripId = value; } }, metadata: _metadata }, _tripId_initializers, _tripId_extraInitializers);
            __esDecorate(null, null, _budgetId_decorators, { kind: "field", name: "budgetId", static: false, private: false, access: { has: obj => "budgetId" in obj, get: obj => obj.budgetId, set: (obj, value) => { obj.budgetId = value; } }, metadata: _metadata }, _budgetId_initializers, _budgetId_extraInitializers);
            __esDecorate(null, null, _category_decorators, { kind: "field", name: "category", static: false, private: false, access: { has: obj => "category" in obj, get: obj => obj.category, set: (obj, value) => { obj.category = value; } }, metadata: _metadata }, _category_initializers, _category_extraInitializers);
            __esDecorate(null, null, _amount_decorators, { kind: "field", name: "amount", static: false, private: false, access: { has: obj => "amount" in obj, get: obj => obj.amount, set: (obj, value) => { obj.amount = value; } }, metadata: _metadata }, _amount_initializers, _amount_extraInitializers);
            __esDecorate(null, null, _currency_decorators, { kind: "field", name: "currency", static: false, private: false, access: { has: obj => "currency" in obj, get: obj => obj.currency, set: (obj, value) => { obj.currency = value; } }, metadata: _metadata }, _currency_initializers, _currency_extraInitializers);
            __esDecorate(null, null, _description_decorators, { kind: "field", name: "description", static: false, private: false, access: { has: obj => "description" in obj, get: obj => obj.description, set: (obj, value) => { obj.description = value; } }, metadata: _metadata }, _description_initializers, _description_extraInitializers);
            __esDecorate(null, null, _date_decorators, { kind: "field", name: "date", static: false, private: false, access: { has: obj => "date" in obj, get: obj => obj.date, set: (obj, value) => { obj.date = value; } }, metadata: _metadata }, _date_initializers, _date_extraInitializers);
            __esDecorate(null, null, _paidBy_decorators, { kind: "field", name: "paidBy", static: false, private: false, access: { has: obj => "paidBy" in obj, get: obj => obj.paidBy, set: (obj, value) => { obj.paidBy = value; } }, metadata: _metadata }, _paidBy_initializers, _paidBy_extraInitializers);
            __esDecorate(null, null, _splitWith_decorators, { kind: "field", name: "splitWith", static: false, private: false, access: { has: obj => "splitWith" in obj, get: obj => obj.splitWith, set: (obj, value) => { obj.splitWith = value; } }, metadata: _metadata }, _splitWith_initializers, _splitWith_extraInitializers);
            __esDecorate(null, null, _createdAt_decorators, { kind: "field", name: "createdAt", static: false, private: false, access: { has: obj => "createdAt" in obj, get: obj => obj.createdAt, set: (obj, value) => { obj.createdAt = value; } }, metadata: _metadata }, _createdAt_initializers, _createdAt_extraInitializers);
            __esDecorate(null, null, _trip_decorators, { kind: "field", name: "trip", static: false, private: false, access: { has: obj => "trip" in obj, get: obj => obj.trip, set: (obj, value) => { obj.trip = value; } }, metadata: _metadata }, _trip_initializers, _trip_extraInitializers);
            __esDecorate(null, null, _budget_decorators, { kind: "field", name: "budget", static: false, private: false, access: { has: obj => "budget" in obj, get: obj => obj.budget, set: (obj, value) => { obj.budget = value; } }, metadata: _metadata }, _budget_initializers, _budget_extraInitializers);
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            Expense = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        id = __runInitializers(this, _id_initializers, void 0);
        tripId = (__runInitializers(this, _id_extraInitializers), __runInitializers(this, _tripId_initializers, void 0));
        budgetId = (__runInitializers(this, _tripId_extraInitializers), __runInitializers(this, _budgetId_initializers, void 0));
        category = (__runInitializers(this, _budgetId_extraInitializers), __runInitializers(this, _category_initializers, void 0));
        amount = (__runInitializers(this, _category_extraInitializers), __runInitializers(this, _amount_initializers, void 0));
        currency = (__runInitializers(this, _amount_extraInitializers), __runInitializers(this, _currency_initializers, void 0));
        description = (__runInitializers(this, _currency_extraInitializers), __runInitializers(this, _description_initializers, void 0));
        date = (__runInitializers(this, _description_extraInitializers), __runInitializers(this, _date_initializers, void 0));
        paidBy = (__runInitializers(this, _date_extraInitializers), __runInitializers(this, _paidBy_initializers, void 0));
        splitWith = (__runInitializers(this, _paidBy_extraInitializers), __runInitializers(this, _splitWith_initializers, void 0));
        createdAt = (__runInitializers(this, _splitWith_extraInitializers), __runInitializers(this, _createdAt_initializers, void 0));
        trip = (__runInitializers(this, _createdAt_extraInitializers), __runInitializers(this, _trip_initializers, void 0));
        budget = (__runInitializers(this, _trip_extraInitializers), __runInitializers(this, _budget_initializers, void 0));
        constructor() {
            __runInitializers(this, _budget_extraInitializers);
        }
    };
    return Expense = _classThis;
})();
export { Expense };
