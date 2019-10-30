import { executeQuery, ILS } from './mssqlEngine';
import { performance } from 'perf_hooks';
import moment  from 'moment/src/lib/moment';

export interface QueryObj {
    data: any;
    queryTime: number;
    sql: string;
}

export function getPatronRegistrations({ server, branch, organizationID, date = null }: { server: ILS; branch: string; organizationID: number; date?: Date; }) {
    return new Promise<any>((resolve, reject) => {

        const newDate = !date ? moment().subtract(10, 'years') : moment(date);

        let sql = `
        select cast(RegistrationDate as DATE) as RegistrationDate,p.OrganizationID as BranchID,po.OrganizationID,
        o.Abbreviation as BranchName,po.Name,po.Abbreviation as OrgName, count(*) as Count 
        from PatronRegistration pr
        join Patrons p on p.PatronID=pr.PatronID
        join Organizations o on o.OrganizationID=p.OrganizationID
        join Organizations po on o.ParentOrganizationID=po.OrganizationID
        where RegistrationDate > '${newDate.format('YYYY-MM-DD')}' and o.Abbreviation = '${branch}'
        group by cast(RegistrationDate as DATE),p.OrganizationID,o.Abbreviation,po.Name,po.Abbreviation,po.OrganizationID
        order by cast(RegistrationDate as DATE) desc`;
        if (branch === 'ALL') {
            sql = `
        select cast(RegistrationDate as DATE) as RegistrationDate,po.OrganizationID,po.Name,po.Abbreviation as OrgName, count(*) as Count 
        from PatronRegistration pr
        join Patrons p on p.PatronID=pr.PatronID
        join Organizations o on o.OrganizationID=p.OrganizationID
        join Organizations po on o.ParentOrganizationID=po.OrganizationID
        where RegistrationDate > '${newDate.format('YYYY-MM-DD')}' and po.OrganizationID=${organizationID}
        group by cast(RegistrationDate as DATE),po.Name,po.Abbreviation,po.OrganizationID
        order by cast(RegistrationDate as DATE) desc`;
        }
      
        // console.log(sql);
        const timeStart = performance.now();
        executeQuery(server, sql).then(data => {
            const queryObj: QueryObj = {
                data,
                queryTime: performance.now() - timeStart,
                sql
            };
            resolve(queryObj);
        }).catch(err => reject({ err, sql }));
    });
}
