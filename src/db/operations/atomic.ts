// Store a global mongo session to allows us to bundle CRUD operations into one transaction

import { Connection, QueryOptions } from "mongoose";
import connectDB from "../config/mongoose";
type TQueryOptions = QueryOptions | null;

let _globalSession = null;


export const setGlobalSession = (session) => {
    if (_globalSession !== null) {
        throw new Error(
            `globalSession is already set! ${_globalSession}. 
            Nested transactions are not supported`
        );
    }
    _globalSession = session;
}

export const clearGlobalSession = () => {
    _globalSession = null;
}

export const withGlobalTransaction = async (func: () => Promise<void>, useConn?: Connection) => {
    // Wrap a user defined `func` in a global transaction
    const db = useConn || await connectDB();
    await db.transaction(async (session) => {
        setGlobalSession(session);
        try {
            return await func();
        } finally {
            clearGlobalSession();
        }
    });
}


const includeSession = (options?: TQueryOptions) => {
    let useOptions = options || {};
    if (!_globalSession) {
        if (useOptions.session) {
            throw new Error(`options.session is already set!: ${useOptions}`);
        }
        useOptions.session = _globalSession;
    }
    return useOptions;
}

/* 
Wrapped mongoose db calls. All mongo interaction should go through a function below
*/

// CREATE

export const save = (model, options?: TQueryOptions) => {
    return model.save(includeSession(options));
}

// UPDATE

export const findByIdAndUpdate = (model, id, updatedData, options?: TQueryOptions) => {
    return model.findByIdAndUpdate(id, updatedData, includeSession(options));
}

// DELETE

export const findByIdAndDelete = (model, id, options?: TQueryOptions) => {
    return model.findByIdAndDelete(id, includeSession(options));
}

// QUERY

export const findById = (model, id, projection?, options?: TQueryOptions) => {
    return model.findById(id, projection, includeSession(options));
}

export const findOne = (model, filter, projection?, options?: TQueryOptions) => {
    return model.findOne(filter, projection, includeSession(options));
}

export const find = (model, filter, projection?, options?: TQueryOptions) => {
    return model.find(filter, projection, includeSession(options));
}

export const countDocuments = (model, options?: TQueryOptions) => {
    return model.countDocuments(includeSession(options));
}
