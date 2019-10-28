/*eslint-env node*/
/* eslint-disable  no-console */
'use strict';

import { Connection, ISOLATION_LEVEL, Request } from 'tedious';


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

export function ilsConfig(): ILS {

    return  {
        ilsID: 1,
        ilsName: 'Acquisitions',
        server: '10.5.0.113',
        authentication: {
            type: 'default',
            options: {
                userName: 'polaris',
                password: 'polaris'
            }
        },
        options: {
            encrypt: false,
            database: 'Polaris',
            isolationLevel: ISOLATION_LEVEL.READ_UNCOMMITTED
        }
    };
}

export function executeQuery(query, callback):void {
    const connection = new Connection(ilsConfig);
    const TotalRows = [];

    connection.on('connect', (err) => {
        // console.log('Connected ' + config.ilsName + ' : ' + config.server);
        if (err) {
            console.log(err);
        }
        const request = new Request(query, (err2) => {
            if (err2) {
                console.log(err2);
                console.log(ilsConfig().ilsName);
                callback(err2);
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
            callback(null, TotalRows);
            connection.close();
        });
        connection.execSql(request);
    });

}



