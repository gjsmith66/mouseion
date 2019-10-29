/*eslint-env node*/
/* eslint-disable  no-console */
'use strict';

import { Connection, Request } from 'tedious';
// import * as SqlString from 'sqlstring';

export interface Library {
    libraryid: number;
    ilsID: number;
    OrganizationID: number;
}
export interface ILS {
    ilsID: number;
    ilsName: string;
    server: string;
    authentication: Authentication;
    options: Options;
}
export interface Authentication {
    type: string;
    options: AuthOptions;
}
export interface AuthOptions {
    userName: string;
    password: string;
}
export interface Options {
    encrypt: boolean;
    database: string;
    isolationLevel: any;
}


export function executeQuery(server, query) {
    return new Promise((resolve, reject) => {
        const connection = new Connection(server);
        const TotalRows = [];
        connection.on('connect', (err) => {
            // console.log('Connected ' + config.ilsName + ' : ' + config.server);
            if (err) {
                reject(err);
            }
            const request = new Request(query, (err2) => {
                if (err2) {
                    reject(err2);
                }
            });
            request.on('row', (columns) => {
                const row = {};
                columns.forEach((column) => {
                    row[column.metadata.colName] = column.value;
                });
                TotalRows.push(row);
                // console.log('row');
            });
            request.on('requestCompleted', () => {
                resolve(TotalRows);
                connection.close();
            });
            connection.execSql(request);
        });

    })
}



