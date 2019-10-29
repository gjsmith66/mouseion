import { executeQuery, ILS } from './mssqlEngine';
import { performance } from 'perf_hooks';
import moment = require('moment');

export function getPatronRegistrations(server: ILS, branch: string, organizationID: number, date: Date = null) {
    return new Promise<any>((resolve, reject) => {

        const branchSQL = branch === 'ALL'
            ? `and po.OrganizationID=${organizationID}`
            : `and o.Abbreviation = '${branch}'`
        const newDate = !date ? moment().subtract(10, 'years') : moment(date);
        const sql = `
            select cast(RegistrationDate as DATE) as RegistrationDate,p.OrganizationID as BranchID,po.OrganizationID,
            o.Abbreviation as BranchName,po.Name,po.Abbreviation as OrgName, count(*) as Count 
            from PatronRegistration pr
            join Patrons p on p.PatronID=pr.PatronID
            join Organizations o on o.OrganizationID=p.OrganizationID
            join Organizations po on o.ParentOrganizationID=po.OrganizationID
            where RegistrationDate > '${newDate.format('YYYY-MM-DD')}' ${branchSQL}
            group by cast(RegistrationDate as DATE),p.OrganizationID,o.Abbreviation,po.Name,po.Abbreviation,po.OrganizationID
            order by cast(RegistrationDate as DATE) desc`;

        // console.log(sql);
        const timeStart = performance.now();
        executeQuery(server, sql).then(data => {
            const queryObj = {
                data,
                queryTime: performance.now() - timeStart,
                sql
            };
            resolve(queryObj);
        }).catch(err => reject(err));
    });
}
