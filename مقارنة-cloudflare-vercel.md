# مقارنة Cloudflare Pages و Vercel

| البند | Cloudflare Pages Free | Cloudflare Pages Pro | Vercel Hobby | Vercel Pro |
|---|---:|---:|---:|---:|
| الاستخدام التجاري | مسموح غالبا | مسموح | مقيد للاستخدام غير التجاري | مسموح |
| السعر | مجاني | مدفوع حسب خطة Cloudflare | مجاني | 20 دولار شهريا للمقعد الاول |
| نقل البيانات للملفات static | غير محدود للملفات الثابتة | غير محدود للملفات الثابتة | 100GB شهريا كإرشاد | 1TB شهريا |
| عدد المشاريع | 100 مشروع للحساب | 100 مشروع للحساب | 200 مشروع | غير محدود |
| عدد عمليات البناء شهريا | 500 | 5,000 | حسب حدود النشر العامة | حسب الاستخدام والفوترة |
| عمليات البناء المتزامنة | 1 | 5 | 1 | حتى 500 عند الطلب |
| وقت عملية البناء الواحدة | 20 دقيقة | 20 دقيقة | 45 دقيقة | 45 دقيقة |
| عدد الملفات في الموقع | 20,000 | 100,000 | غير محدد بنفس صيغة Cloudflare | غير محدد بنفس صيغة Cloudflare |
| حجم الملف الواحد | 25MiB | 25MiB | ضمن حد رفع الملفات الثابتة 100MB | ضمن حد رفع الملفات الثابتة 1GB |
| رفع الملفات الثابتة | حد الملف الواحد 25MiB | حد الملف الواحد 25MiB | 100MB | 1GB |
| الدومينات المخصصة لكل مشروع | 100 | 250 | مرتفع، لكن Hobby ليس للتجاري | 100,000 soft limit |
| Preview deployments | غير محدود | غير محدود | مدعوم | مدعوم |
| Redirects / Routes | 2,000 static + 100 dynamic | 2,000 static + 100 dynamic | 2048 route لكل deployment | 2048 route لكل deployment |
| متغيرات البيئة | مدعومة | مدعومة | مدعومة | مدعومة |
| Functions / API | Pages Functions عبر Workers | Pages Functions عبر Workers | Vercel Functions | Vercel Functions |
| حد Functions المجاني | 100,000 request يوميا مشتركة مع Workers | حسب Workers Paid | 1M invocation شهريا كإرشاد | Usage-based |
| ذاكرة Functions | Workers isolate: 128MB | Workers isolate: 128MB | 2GB | 4GB |
| مدة Functions | HTTP بدون hard wall limit، مع حد CPU | CPU حتى 5 دقائق في المدفوع | 300 ثانية | 300 ثانية افتراضيا، وقد تصل إلى 800/1800 حسب الإعداد |
| حماية DDoS و CDN و DNS | أقوى | أقوى | جيد | جيد |
| ربط دومين Namecheap | ممتاز، خصوصا مع نقل nameservers إلى Cloudflare | ممتاز | سهل عبر A/CNAME | سهل عبر A/CNAME |
| سهولة الاستخدام | متوسطة | متوسطة | الأسهل | الأسهل |

## الخلاصة

| الحالة | الاختيار الأنسب |
|---|---|
| تريد تشغيل منصة حقيقية بتكلفة بداية منخفضة | Cloudflare Pages Free |
| تريد DNS وحماية وSSL في مكان واحد | Cloudflare Pages |
| تريد أسهل تجربة نشر ولوحة تحكم | Vercel |
| تريد استخدام Vercel لمشروع تجاري | Vercel Pro |
| مشروعك الحالي Expo Web + Supabase + Namecheap | Cloudflare Pages + Supabase |
