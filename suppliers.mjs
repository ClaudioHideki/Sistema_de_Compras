const fail=message=>{const e=new Error(message);e.status=400;throw e;};
const text=(value,label,optional=false)=>{if(optional&&(value===undefined||value===''))return '';if(typeof value!=='string'||!value.trim()||value.length>300)fail(`${label}: preencha até 300 caracteres.`);return value.trim();};
export function email(value,label='E-mail'){const result=text(value,label).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(result))fail(`${label}: e-mail inválido.`);return result;}
export function phone(value,label='WhatsApp'){const result=text(value,label).replace(/[+\s().-]/g,'');if(!/^\d{10,15}$/.test(result))fail(`${label}: informe país, DDD e número.`);return result;}
export function prepareSupplier(b){
 const document=text(b.document,'CNPJ').replace(/[.\/\s-]/g,'').toUpperCase();if(!/^[A-Z0-9]{12}\d{2}$/.test(document))fail('CNPJ: informe os 14 caracteres do cadastro.');
 const uf=text(b.uf,'UF').toUpperCase();if(!'AC AL AP AM BA CE DF ES GO MA MT MS MG PA PB PR PE PI RJ RN RS RO RR SC SP SE TO'.split(' ').includes(uf))fail('UF inválida.');
 const postal_code=text(b.postal_code,'CEP').replace(/[\s-]/g,'');if(!/^\d{8}$/.test(postal_code))fail('CEP: informe 8 dígitos.');
 const website=text(b.website,'Site',true);if(website){try{if(!['http:','https:'].includes(new URL(website).protocol))throw Error();}catch{fail('Site: informe um endereço com https://.');}}
 const profile={trade_name:text(b.trade_name,'Nome fantasia'),state_registration:text(b.state_registration,'Inscrição estadual',true),municipal_registration:text(b.municipal_registration,'Inscrição municipal',true),tax_regime:text(b.tax_regime,'Regime tributário',true),category:text(b.category,'Categoria de fornecimento'),postal_code,street:text(b.street,'Logradouro'),address_number:text(b.address_number,'Número'),complement:text(b.complement,'Complemento',true),district:text(b.district,'Bairro'),city:text(b.city,'Cidade'),uf,company_email:email(b.company_email,'E-mail da empresa'),company_phone:phone(b.company_phone,'WhatsApp da empresa'),website,payment_terms:text(b.payment_terms,'Condições de pagamento',true)};
 const contacts=['commercial','financial'].map(type=>({type:type==='commercial'?'comercial':'financeiro',name:text(b[type+'_name'],`Responsável ${type==='commercial'?'comercial':'financeiro'}`),position:text(b[type+'_position'],'Cargo',true),email:email(b[type+'_email'],`E-mail ${type==='commercial'?'comercial':'financeiro'}`),phone:phone(b[type+'_phone'],`WhatsApp ${type==='commercial'?'comercial':'financeiro'}`),whatsapp_optin:b[type+'_optin']===true?1:0}));
 return {name:text(b.name,'Razão social'),document,profile,contacts};
}
export function saveSupplierDetails(db,id,prepared){
 db.prepare('INSERT INTO supplier_profiles VALUES(?,?) ON CONFLICT(supplier_id) DO UPDATE SET detail=excluded.detail').run(id,JSON.stringify(prepared.profile));
 for(const c of prepared.contacts)db.prepare('INSERT INTO supplier_department_contacts VALUES(?,?,?,?,?,?,?) ON CONFLICT(supplier_id,department) DO UPDATE SET name=excluded.name,position=excluded.position,email=excluded.email,phone=excluded.phone,whatsapp_optin=excluded.whatsapp_optin').run(id,c.type,c.name,c.position,c.email,c.phone,c.whatsapp_optin);
 const c=prepared.contacts[0];db.prepare('INSERT INTO supplier_contacts VALUES(?,?,?,?,?) ON CONFLICT(supplier_id) DO UPDATE SET contact=excluded.contact,email=excluded.email,phone=excluded.phone,whatsapp_optin=excluded.whatsapp_optin').run(id,c.name,c.email,c.phone,c.whatsapp_optin);
}
export function supplierContact(db,id,department='comercial'){
 const c=db.prepare('SELECT * FROM supplier_department_contacts WHERE supplier_id=? AND department=?').get(id,department);if(c)return {...c,contact:c.name};
 if(department==='comercial')return db.prepare('SELECT * FROM supplier_contacts WHERE supplier_id=?').get(id);return null;
}
export function supplierSnapshot(db){return db.prepare('SELECT s.*,p.detail FROM suppliers s LEFT JOIN supplier_profiles p ON p.supplier_id=s.id').all().map(s=>{const commercial=supplierContact(db,s.id),financial=supplierContact(db,s.id,'financeiro');const {detail,...base}=s;return {...base,profile:detail?JSON.parse(detail):null,commercial,financial,contact:commercial?.contact,email:commercial?.email,phone:commercial?.phone,whatsapp_optin:commercial?.whatsapp_optin};});}
