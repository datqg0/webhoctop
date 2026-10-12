"""Idempotent seed for complete subject practice sets, including Informatics."""

from app.models import Exam, ExamQuestion, Question, Subject


SUBJECTS = [
    ("sub-toan", "Toán học", "toan", "Calculator", "Đại số, giải tích và hình học"),
    ("sub-ly", "Vật lý", "ly", "Atom", "Dao động, điện học và vật lý hiện đại"),
    ("sub-hoa", "Hóa học", "hoa", "FlaskConical", "Hóa hữu cơ và hóa vô cơ"),
    ("sub-sinh", "Sinh học", "sinh", "Dna", "Di truyền, tiến hóa và sinh thái"),
    ("sub-anh", "Tiếng Anh", "anh", "Languages", "Ngữ pháp, từ vựng và đọc hiểu"),
    ("sub-tin", "Tin học", "tin", "Code2", "Lập trình, dữ liệu và kỹ năng số"),
]


def question(content, a, b, c, d, answer, explanation):
    return (content, (a, b, c, d), answer, explanation)


# Each pack contains ten questions. Answer is the zero-based option index.
PACKS = [
    {
        "code": "toan", "id": "catalog-toan-01", "title": "Toán 12 – Tổng hợp giải tích và hình học",
        "topic": "Ôn tập Toán 12", "lesson": "Đề luyện tập tổng hợp", "grade": 12, "minutes": 25,
        "questions": [
            question("Đạo hàm của $f(x)=x^3-3x$ là:", "$3x^2-3$", "$x^2-3$", "$3x^2$", "$x^3-3$", 0, "Dùng quy tắc đạo hàm lũy thừa: $(x^3)'=3x^2$ và $(-3x)'=-3$."),
            question("Hàm số $y=x^3-3x$ đạt cực đại tại điểm nào?", "$x=-1$", "$x=0$", "$x=1$", "$x=3$", 0, "$y'=3(x-1)(x+1)$ đổi dấu từ dương sang âm tại $x=-1$, nên hàm đạt cực đại tại đó."),
            question("Tiệm cận đứng của $y=\\frac{2x+1}{x-4}$ là:", "$x=-4$", "$x=4$", "$y=2$", "$y=-2$", 1, "Mẫu số bằng 0 tại $x=4$, còn tử số khác 0 nên đây là tiệm cận đứng."),
            question("Giá trị của $\\int_0^2 2x\\,dx$ bằng:", "$2$", "$4$", "$6$", "$8$", 1, "$\\int 2x\\,dx=x^2$, do đó giá trị là $2^2-0^2=4$."),
            question("Một nguyên hàm của $\\cos x$ là:", "$-\\sin x$", "$\\sin x$", "$\\tan x$", "$-\\cos x$", 1, "Vì $(\\sin x)'=\\cos x$, một nguyên hàm là $\\sin x+C$."),
            question("Trong không gian, mặt phẳng $2x-y+3z-5=0$ có một vectơ pháp tuyến là:", "$(2,-1,3)$", "$(2,1,3)$", "$(2,-1,-5)$", "$(-1,3,-5)$", 0, "Các hệ số của $x,y,z$ tạo thành vectơ pháp tuyến $(2,-1,3)$."),
            question("Khoảng cách từ điểm $A(0,0,0)$ đến mặt phẳng $3x+4y-10=0$ bằng:", "$1$", "$2$", "$3$", "$4$", 1, "Khoảng cách bằng $|-10|/\\sqrt{3^2+4^2}=10/5=2$."),
            question("Gieo một con xúc xắc cân đối. Xác suất xuất hiện số chẵn là:", "$\\frac{1}{6}$", "$\\frac{1}{3}$", "$\\frac{1}{2}$", "$\\frac{2}{3}$", 2, "Có ba kết quả chẵn trong sáu kết quả đồng khả năng, nên xác suất là $3/6=1/2$."),
            question("Số trung bình của dãy $2,4,6,8$ là:", "$4$", "$5$", "$6$", "$20$", 1, "Tổng các giá trị là 20; chia cho 4 phần tử được 5."),
            question("Nghiệm của phương trình $\\log_2 x=3$ là:", "$x=6$", "$x=8$", "$x=9$", "$x=\\frac{1}{8}$", 1, "$\\log_2x=3$ tương đương $x=2^3=8$."),
        ],
    },
    {
        "code": "ly", "id": "catalog-ly-01", "title": "Vật lý 12 – Dao động, sóng và điện xoay chiều",
        "topic": "Ôn tập Vật lý 12", "lesson": "Đề luyện tập tổng hợp", "grade": 12, "minutes": 25,
        "questions": [
            question("Vật dao động $x=4\\cos(5t+\\frac{\\pi}{3})$ cm có biên độ bằng:", "$4$ cm", "$5$ cm", "$\\frac{\\pi}{3}$ cm", "$20$ cm", 0, "Biên độ là hệ số đứng trước hàm cos, nên $A=4$ cm."),
            question("Trong dao động điều hòa, gia tốc và li độ liên hệ bởi:", "$a=\\omega x$", "$a=-\\omega^2x$", "$a=\\omega^2x$", "$a=-\\omega x$", 1, "Gia tốc là đạo hàm bậc hai của li độ: $a=x''=-\\omega^2x$."),
            question("Con lắc đơn dài $1$ m ở nơi có $g=\\pi^2$ m/s² có chu kỳ:", "$0,5$ s", "$1$ s", "$2$ s", "$4$ s", 2, "$T=2\\pi\\sqrt{l/g}=2\\pi\\sqrt{1/\\pi^2}=2$ s."),
            question("Sóng cơ truyền với tốc độ $20$ m/s, tần số $5$ Hz. Bước sóng là:", "$2$ m", "$4$ m", "$10$ m", "$100$ m", 1, "$\\lambda=v/f=20/5=4$ m."),
            question("Đơn vị của cường độ dòng điện là:", "Vôn", "Oát", "Ampe", "Jun", 2, "Cường độ dòng điện có đơn vị SI là ampe (A)."),
            question("Định luật Ôm cho đoạn mạch có điện trở $R$ là:", "$I=UR$", "$I=U/R$", "$I=R/U$", "$U=I/R$", 1, "Định luật Ôm viết $I=U/R$."),
            question("Trong mạch xoay chiều chỉ có cuộn cảm lý tưởng, dòng điện:", "Sớm pha hơn điện áp $\\pi/2$", "Trễ pha hơn điện áp $\\pi/2$", "Cùng pha điện áp", "Ngược pha điện áp", 1, "Với cuộn cảm thuần, dòng điện trễ pha hơn điện áp một góc $\\pi/2$."),
            question("Máy biến áp hoạt động dựa trên hiện tượng:", "Quang điện", "Cảm ứng điện từ", "Nhiệt điện", "Phóng xạ", 1, "Dòng điện xoay chiều ở cuộn sơ cấp tạo từ thông biến thiên, gây cảm ứng ở cuộn thứ cấp."),
            question("Photon có năng lượng được tính bằng:", "$E=hf$", "$E=h/f$", "$E=f/h$", "$E=mc$", 0, "Năng lượng photon bằng hằng số Planck nhân tần số: $E=hf$."),
            question("Hạt nhân $^{14}_{6}C$ có số nơtron là:", "$6$", "$8$", "$14$", "$20$", 1, "Số nơtron bằng số khối trừ số proton: $14-6=8$."),
        ],
    },
    {
        "code": "hoa", "id": "catalog-hoa-01", "title": "Hóa học 12 – Hữu cơ và đại cương",
        "topic": "Ôn tập Hóa học 12", "lesson": "Đề luyện tập tổng hợp", "grade": 12, "minutes": 25,
        "questions": [
            question("Thủy phân etyl axetat trong NaOH tạo ra:", "Natri axetat và etanol", "Natri fomat và metanol", "Axit axetic và etilen", "Etan và natri cacbonat", 0, "$CH_3COOC_2H_5+NaOH\\rightarrow CH_3COONa+C_2H_5OH$."),
            question("Công thức phân tử của glucozơ là:", "$C_6H_{12}O_6$", "$C_{12}H_{22}O_{11}$", "$C_2H_5OH$", "$C_6H_6$", 0, "Glucozơ là monosaccarit có công thức $C_6H_{12}O_6$."),
            question("Chất làm quỳ tím hóa xanh là:", "$CH_3NH_2$", "$CH_3COOH$", "$C_6H_5OH$", "$CO_2$", 0, "Metylamin có tính bazơ nên làm quỳ tím ẩm hóa xanh."),
            question("Amino axit đơn giản nhất là:", "Alanin", "Glyxin", "Valin", "Lysin", 1, "Glyxin có công thức $NH_2CH_2COOH$ và là amino axit đơn giản nhất."),
            question("Polime tạo thành từ phản ứng trùng hợp etilen là:", "PVC", "Polietilen", "Nilon-6,6", "Tinh bột", 1, "Các phân tử etilen trùng hợp tạo mạch polietilen $(-CH_2-CH_2-)_n$."),
            question("Kim loại nào phản ứng mạnh với nước lạnh tạo khí hiđro?", "Cu", "Ag", "Na", "Au", 2, "Natri phản ứng với nước: $2Na+2H_2O\\rightarrow2NaOH+H_2$."),
            question("Số oxi hóa của lưu huỳnh trong $H_2SO_4$ là:", "$+2$", "$+4$", "$+6$", "$-2$", 2, "$2(+1)+x+4(-2)=0$, suy ra $x=+6$."),
            question("Dung dịch có pH nhỏ hơn 7 có môi trường:", "Axit", "Bazơ", "Trung tính", "Không xác định", 0, "Ở 25°C, dung dịch axit có pH nhỏ hơn 7."),
            question("Chất nào sau đây là hiđrocacbon no mạch hở?", "$C_2H_4$", "$C_2H_2$", "$C_2H_6$", "$C_6H_6$", 2, "Etan $C_2H_6$ chỉ có liên kết đơn C-C và C-H."),
            question("Trong phản ứng oxi hóa - khử, chất khử là chất:", "Nhận electron", "Nhường electron", "Không trao đổi electron", "Luôn chứa oxi", 1, "Chất khử nhường electron và bản thân bị oxi hóa."),
        ],
    },
    {
        "code": "sinh", "id": "catalog-sinh-01", "title": "Sinh học 12 – Di truyền và tiến hóa",
        "topic": "Ôn tập Sinh học 12", "lesson": "Đề luyện tập tổng hợp", "grade": 12, "minutes": 25,
        "questions": [
            question("Đơn phân cấu tạo nên ADN là:", "Axit amin", "Nuclêôtit", "Glucôzơ", "Axit béo", 1, "ADN là đại phân tử gồm các đơn phân nuclêôtit."),
            question("Trong ADN, bazơ nitơ nào bắt cặp với A?", "G", "C", "T", "U", 2, "Trong ADN, A liên kết bổ sung với T; G liên kết với C."),
            question("Quá trình phiên mã tạo ra phân tử:", "mARN", "ADN mới", "Prôtêin", "Lipit", 0, "Phiên mã dùng mạch khuôn ADN để tổng hợp ARN, thường là mARN."),
            question("Theo phân li độc lập, phép lai $AaBb\\times AaBb$ có xác suất kiểu hình lặn cả hai tính trạng là:", "$1/4$", "$3/16$", "$1/16$", "$9/16$", 2, "Mỗi tính trạng lặn có xác suất $1/4$; hai tính trạng độc lập nên $1/4\\times1/4=1/16$."),
            question("Đột biến thay thế một cặp nuclêôtit thuộc dạng:", "Đột biến gen", "Đột biến lệch bội", "Đột biến đa bội", "Đột biến cấu trúc nhiễm sắc thể", 0, "Thay thế một cặp nuclêôtit làm biến đổi trình tự một gen, thuộc đột biến gen."),
            question("Quá trình tạo ra các alen mới trong quần thể là:", "Đột biến", "Giao phối không ngẫu nhiên", "Di - nhập gen bằng không", "Chọn lọc ổn định", 0, "Đột biến tạo alen mới và là nguồn nguyên liệu sơ cấp của tiến hóa."),
            question("Chọn lọc tự nhiên tác động trực tiếp lên:", "Kiểu gen", "Kiểu hình", "Nhiễm sắc thể", "Chỉ alen lặn", 1, "Chọn lọc tự nhiên tác động trực tiếp lên kiểu hình, qua đó làm biến đổi tần số kiểu gen và alen."),
            question("Trong chuỗi thức ăn, sinh vật sản xuất thường là:", "Thực vật xanh", "Động vật ăn thịt", "Nấm phân hủy", "Động vật ăn cỏ", 0, "Thực vật xanh quang hợp, chuyển năng lượng ánh sáng thành hóa năng."),
            question("Một quần thể có tần số alen $A=0,7$ cân bằng Hardy-Weinberg có tần số kiểu gen $Aa$ là:", "$0,09$", "$0,21$", "$0,42$", "$0,49$", 2, "$2pq=2\\times0,7\\times0,3=0,42$."),
            question("Trong giảm phân, trao đổi chéo thường xảy ra ở:", "Kì đầu I", "Kì giữa II", "Kì sau II", "Kì cuối I", 0, "Trao đổi chéo xảy ra giữa các crômatit không chị em ở kì đầu I."),
        ],
    },
    {
        "code": "anh", "id": "catalog-anh-01", "title": "Tiếng Anh – Grammar and Vocabulary Practice",
        "topic": "English Review", "lesson": "Mixed grammar and vocabulary", "grade": 12, "minutes": 25,
        "questions": [
            question("Choose the correct form: She _____ to school by bus every day.", "go", "goes", "going", "gone", 1, "The subject 'she' takes the present simple verb form 'goes'."),
            question("Choose the correct tense: They _____ dinner when I called.", "have", "had", "were having", "are having", 2, "An action in progress interrupted by another past action takes the past continuous."),
            question("Choose the correct relative pronoun: The book _____ I borrowed is interesting.", "who", "whose", "which", "where", 2, "'Which' refers to the thing 'the book' in a defining relative clause."),
            question("Choose the correct conditional: If it rains tomorrow, we _____ at home.", "stay", "stayed", "will stay", "would stayed", 2, "The first conditional uses if + present simple and will + base verb."),
            question("Choose the correct passive form: The letters _____ yesterday.", "send", "sent", "were sent", "are sending", 2, "Past simple passive is formed with was/were + past participle."),
            question("Choose the word closest in meaning to 'rapid'.", "slow", "quick", "weak", "late", 1, "'Rapid' means fast or quick."),
            question("Choose the correct preposition: She is interested _____ learning languages.", "at", "on", "in", "for", 2, "The adjective 'interested' is followed by the preposition 'in'."),
            question("Choose the correct article: He is _____ honest student.", "a", "an", "the", "no article", 1, "'Honest' begins with a vowel sound, so it takes 'an'."),
            question("Choose the correct comparative: This exercise is _____ than the last one.", "easy", "easier", "easiest", "more easy", 1, "For a short adjective ending in consonant + y, change y to i and add -er."),
            question("Choose the correct reported speech: He said, 'I am tired.'", "He said he is tired.", "He said he was tired.", "He says he was tired.", "He said I was tired.", 1, "In reported speech with a past reporting verb, present 'am' backshifts to 'was'."),
        ],
    },
    {
        "code": "tin", "id": "catalog-tin-01", "title": "Tin học 1 – Python cơ bản",
        "topic": "Lập trình Python", "lesson": "Biến, kiểu dữ liệu và câu lệnh", "grade": 10, "minutes": 20,
        "questions": [
            question("Trong Python, kiểu dữ liệu của giá trị `True` là:", "int", "str", "bool", "float", 2, "True và False là hai giá trị thuộc kiểu dữ liệu bool."),
            question("Kết quả của biểu thức `7 // 2` trong Python là:", "3", "3.5", "4", "1", 0, "Toán tử // chia lấy phần nguyên, nên 7 // 2 bằng 3."),
            question("Chỉ số của phần tử đầu tiên trong một list Python là:", "0", "1", "-1", "Tùy list", 0, "Python đánh chỉ số list bắt đầu từ 0."),
            question("Lệnh nào thêm phần tử `5` vào cuối list `a`?", "a.add(5)", "a.append(5)", "a.push(5)", "append(a,5)", 1, "Phương thức list.append(value) nối một phần tử vào cuối list."),
            question("`range(2, 6)` tạo ra dãy nào?", "2, 3, 4, 5", "2, 3, 4, 5, 6", "1, 2, 3, 4, 5", "3, 4, 5, 6", 0, "Điểm cuối của range không được lấy; dãy gồm 2, 3, 4, 5."),
            question("Toán tử so sánh bằng trong Python là:", "=", "==", "===", ":=", 1, "Dấu == dùng để so sánh bằng; dấu = dùng để gán."),
            question("Kết quả của `len('Tin hoc')` là:", "6", "7", "8", "5", 1, "Chuỗi gồm 7 ký tự, tính cả dấu cách."),
            question("Cấu trúc nào lặp qua từng phần tử của list?", "if", "for", "def", "class", 1, "Vòng lặp for thường dùng để duyệt lần lượt các phần tử của list."),
            question("Từ khóa nào khai báo một hàm trong Python?", "func", "function", "def", "lambda", 2, "Hàm thông thường được khai báo bằng từ khóa def."),
            question("Giá trị của `3 ** 2` là:", "6", "9", "8", "5", 1, "Toán tử ** là phép lũy thừa: $3^2=9$."),
        ],
    },
    {
        "code": "tin", "id": "catalog-tin-02", "title": "Tin học 2 – Thuật toán và cấu trúc dữ liệu",
        "topic": "Thuật toán", "lesson": "Tìm kiếm, sắp xếp và cấu trúc dữ liệu", "grade": 11, "minutes": 20,
        "questions": [
            question("Tìm kiếm nhị phân cần danh sách đầu vào được:", "Sắp xếp", "Đảo ngẫu nhiên", "Lưu trong stack", "Mã hóa", 0, "Tìm kiếm nhị phân loại bỏ một nửa phạm vi mỗi bước nên danh sách phải được sắp xếp."),
            question("Độ phức tạp thời gian điển hình của tìm kiếm nhị phân là:", "$O(n)$", "$O(n^2)$", "$O(\\log n)$", "$O(1)$", 2, "Mỗi bước giảm một nửa phạm vi tìm kiếm, tạo ra độ phức tạp $O(\\log n)$."),
            question("Cấu trúc dữ liệu hoạt động theo nguyên tắc LIFO là:", "Queue", "Stack", "Tree", "Graph", 1, "Stack dùng nguyên tắc Last In, First Out: vào sau ra trước."),
            question("Hàng đợi (queue) thường hoạt động theo nguyên tắc:", "LIFO", "FIFO", "Ngẫu nhiên", "Ưu tiên nhỏ nhất", 1, "Queue dùng nguyên tắc First In, First Out."),
            question("Thuật toán sắp xếp nổi bọt cơ bản so sánh:", "Hai phần tử kề nhau", "Phần tử đầu và cuối", "Các phần tử ngẫu nhiên", "Chỉ phần tử lớn nhất", 0, "Bubble sort so sánh các cặp phần tử kề nhau và đổi chỗ khi sai thứ tự."),
            question("Vòng lặp chạy n lần bên trong một vòng lặp chạy n lần thường có độ phức tạp:", "$O(n)$", "$O(\\log n)$", "$O(n^2)$", "$O(1)$", 2, "Hai vòng lặp lồng nhau, mỗi vòng n lượt, tạo khoảng $n^2$ thao tác."),
            question("Trong đồ thị, đỉnh (vertex) biểu diễn:", "Một nút", "Một phép cộng", "Một hàng dữ liệu", "Một tệp", 0, "Đồ thị gồm các đỉnh (nút) và các cạnh nối giữa chúng."),
            question("Duyệt BFS thường sử dụng cấu trúc nào?", "Stack", "Queue", "Heap", "Hash table", 1, "BFS duyệt theo từng lớp và dùng queue để lưu các đỉnh chờ."),
            question("Đệ quy là kỹ thuật trong đó hàm:", "Gọi lại chính nó", "Chỉ chạy một lần", "Không có tham số", "Luôn trả về list", 0, "Hàm đệ quy gọi lại chính nó với bài toán nhỏ hơn và cần điều kiện dừng."),
            question("Điều kiện dừng trong thuật toán đệ quy giúp:", "Ngăn gọi vô hạn", "Tăng kích thước dữ liệu", "Sắp xếp tự động", "Tạo biến toàn cục", 0, "Điều kiện dừng kết thúc các lời gọi đệ quy, tránh lặp vô hạn."),
        ],
    },
    {
        "code": "tin", "id": "catalog-tin-03", "title": "Tin học 3 – Cơ sở dữ liệu và SQL",
        "topic": "Cơ sở dữ liệu", "lesson": "Bảng, khóa và truy vấn SQL", "grade": 11, "minutes": 20,
        "questions": [
            question("Trong cơ sở dữ liệu quan hệ, dữ liệu thường được tổ chức thành:", "Bảng", "Ảnh", "Slide", "Âm thanh", 0, "Cơ sở dữ liệu quan hệ lưu dữ liệu trong các bảng gồm hàng và cột."),
            question("Khóa chính (primary key) dùng để:", "Định danh duy nhất mỗi bản ghi", "Mã hóa toàn bộ ổ đĩa", "Sắp xếp mọi cột", "Thay thế tên bảng", 0, "Khóa chính phân biệt duy nhất từng hàng trong một bảng."),
            question("Lệnh SQL nào truy vấn dữ liệu?", "SELECT", "INSERT", "UPDATE", "DELETE", 0, "SELECT dùng để lấy dữ liệu từ một hoặc nhiều bảng."),
            question("Mệnh đề nào lọc các hàng theo điều kiện?", "ORDER BY", "WHERE", "GROUP BY", "VALUES", 1, "WHERE giới hạn kết quả theo điều kiện lọc."),
            question("Lệnh thêm bản ghi mới vào bảng là:", "SELECT", "INSERT INTO", "ALTER TABLE", "DROP TABLE", 1, "INSERT INTO thêm các hàng mới vào bảng."),
            question("`ORDER BY score DESC` sắp xếp điểm theo thứ tự:", "Tăng dần", "Giảm dần", "Ngẫu nhiên", "Theo chữ cái", 1, "DESC là descending, nghĩa là giảm dần."),
            question("Khóa ngoại (foreign key) thường dùng để:", "Liên kết các bảng", "Xóa toàn bộ cơ sở dữ liệu", "Tăng độ sáng màn hình", "Mã hóa mật khẩu", 0, "Khóa ngoại tham chiếu khóa của bảng khác để biểu diễn quan hệ."),
            question("Hàm SQL đếm số hàng là:", "SUM(*)", "COUNT(*)", "TOTAL()", "NUMBER()", 1, "COUNT(*) trả về số hàng trong tập kết quả."),
            question("Lệnh cập nhật giá trị trong các bản ghi là:", "UPDATE", "CREATE", "SELECT", "GRANT", 0, "UPDATE thay đổi dữ liệu hiện có; thường kết hợp WHERE để chọn hàng."),
            question("Sao lưu cơ sở dữ liệu giúp:", "Khôi phục dữ liệu khi mất hoặc hỏng", "Tăng độ phân giải", "Loại bỏ khóa chính", "Thay thế hệ điều hành", 0, "Bản sao lưu cho phép phục hồi dữ liệu sau sự cố hoặc thao tác nhầm."),
        ],
    },
    {
        "code": "tin", "id": "catalog-tin-04", "title": "Tin học 4 – Web và Internet",
        "topic": "Web và Internet", "lesson": "HTML, mạng và dịch vụ web", "grade": 10, "minutes": 20,
        "questions": [
            question("HTML chủ yếu dùng để:", "Tạo cấu trúc nội dung trang web", "Quản lý bộ nhớ RAM", "Định tuyến gói tin", "Tạo hệ điều hành", 0, "HTML đánh dấu cấu trúc và nội dung của tài liệu web."),
            question("Thẻ HTML tạo liên kết là:", "`<p>`", "`<a>`", "`<img>`", "`<table>`", 1, "Thẻ anchor `<a>` tạo liên kết và thường dùng thuộc tính href."),
            question("CSS chủ yếu dùng để:", "Định dạng giao diện trang web", "Lưu dữ liệu quan hệ", "Gửi email", "Nén tệp", 0, "CSS điều khiển màu sắc, bố cục, cỡ chữ và cách trình bày trang web."),
            question("Địa chỉ IP dùng để:", "Định danh thiết bị trên mạng", "Đặt tên biến", "Mở tệp văn bản", "Tăng dung lượng ổ cứng", 0, "Địa chỉ IP giúp định danh và định tuyến đến thiết bị trong mạng IP."),
            question("DNS có chức năng chính là:", "Chuyển tên miền thành địa chỉ IP", "Mã hóa ảnh", "Sắp xếp bảng tính", "Diệt virus", 0, "DNS phân giải tên miền dễ nhớ thành địa chỉ IP tương ứng."),
            question("HTTPS bảo vệ kết nối web chủ yếu bằng:", "Mã hóa TLS", "Nén ZIP", "Đổi địa chỉ MAC", "Tắt cookie", 0, "HTTPS sử dụng TLS để mã hóa và xác thực kết nối giữa trình duyệt và máy chủ."),
            question("Thiết bị chuyển tiếp dữ liệu giữa các mạng là:", "Router", "Bàn phím", "Máy quét", "Loa", 0, "Router định tuyến gói tin giữa các mạng khác nhau."),
            question("URL là:", "Địa chỉ của tài nguyên trên Internet", "Một kiểu bộ nhớ", "Ngôn ngữ lập trình", "Chuẩn nén ảnh", 0, "URL xác định vị trí và cách truy cập một tài nguyên."),
            question("Cookie trên trình duyệt thường được dùng để:", "Lưu một số thông tin phiên/trạng thái", "Tăng tốc CPU", "Thay thế DNS", "Sửa phần cứng", 0, "Cookie lưu dữ liệu nhỏ do website sử dụng, chẳng hạn mã phiên hoặc tùy chọn."),
            question("Công cụ tìm kiếm giúp người dùng:", "Tìm trang và thông tin trên web", "Sửa lỗi phần cứng", "Tạo kết nối điện", "Cấp phát RAM", 0, "Công cụ tìm kiếm lập chỉ mục và tìm nội dung web theo truy vấn."),
        ],
    },
    {
        "code": "tin", "id": "catalog-tin-05", "title": "Tin học 5 – An toàn số và trí tuệ nhân tạo",
        "topic": "An toàn số và AI", "lesson": "Bảo mật, dữ liệu và AI có trách nhiệm", "grade": 12, "minutes": 20,
        "questions": [
            question("Mật khẩu nào an toàn hơn?", "12345678", "password", "Tên và ngày sinh", "Cụm dài, riêng biệt và khó đoán", 3, "Mật khẩu dài, độc nhất và khó đoán giảm nguy cơ bị dò hoặc tái sử dụng."),
            question("Khi nhận email yêu cầu nhập mật khẩu qua liên kết lạ, nên:", "Bấm ngay để tránh khóa tài khoản", "Kiểm tra người gửi và truy cập trang chính thức", "Chuyển tiếp cho mọi người", "Gửi mật khẩu để xác minh", 1, "Đây có thể là phishing; hãy kiểm tra địa chỉ người gửi và tự mở trang chính thức."),
            question("Xác thực đa yếu tố (MFA) tăng bảo mật bằng cách:", "Yêu cầu thêm một yếu tố xác minh", "Rút ngắn mật khẩu", "Tắt mã hóa", "Chia sẻ tài khoản", 0, "MFA kết hợp nhiều yếu tố, ví dụ mật khẩu và mã xác minh trên thiết bị."),
            question("Phần mềm độc hại mã hóa dữ liệu để đòi tiền chuộc gọi là:", "Ransomware", "Firewall", "Compiler", "Cookie", 0, "Ransomware khóa hoặc mã hóa dữ liệu rồi đòi tiền để khôi phục."),
            question("Bản sao lưu nên được lưu:", "Chỉ trên cùng một ổ đĩa", "Ở nơi tách biệt và được bảo vệ", "Trong thư mục tải xuống công khai", "Không cần mật khẩu", 1, "Bản sao tách biệt giúp giảm nguy cơ mất cả bản gốc lẫn bản sao trong cùng sự cố."),
            question("Trong học máy có giám sát, dữ liệu huấn luyện thường có:", "Nhãn mục tiêu", "Chỉ dữ liệu bị xóa", "Không có ví dụ", "Chỉ mã nguồn", 0, "Học có giám sát học từ ví dụ đầu vào đi kèm nhãn hoặc giá trị mục tiêu."),
            question("Dữ liệu thiên lệch trong huấn luyện có thể khiến mô hình:", "Đưa ra kết quả thiên lệch", "Luôn chính xác tuyệt đối", "Không cần kiểm thử", "Tự xóa dữ liệu", 0, "Mô hình có thể học và khuếch đại thiên lệch sẵn có trong dữ liệu."),
            question("Thông tin cá nhân nhạy cảm nên được chia sẻ:", "Công khai trên mạng", "Chỉ khi cần và qua kênh phù hợp", "Trong mọi chatbot", "Trong bình luận công khai", 1, "Giảm chia sẻ dữ liệu cá nhân và chỉ dùng dịch vụ/kênh đáng tin cậy."),
            question("Cập nhật phần mềm thường xuyên giúp:", "Sửa lỗi và vá lỗ hổng bảo mật", "Tắt mọi bảo vệ", "Tăng thư rác", "Xóa bản sao lưu", 0, "Bản cập nhật thường sửa lỗi, cải thiện tính năng và vá lỗ hổng đã phát hiện."),
            question("Khi dùng AI tạo sinh cho bài học, học sinh nên:", "Chép nguyên mọi kết quả", "Kiểm chứng thông tin và ghi nhận hỗ trợ khi cần", "Đưa mật khẩu vào prompt", "Tin mọi câu trả lời là đúng", 1, "AI có thể sai; cần kiểm chứng, bảo vệ dữ liệu riêng tư và dùng minh bạch."),
        ],
    },
]


def seed_full_practice_catalog(db):
    """Add missing subjects, ten-question practice sets, and their questions once."""
    subjects_by_code = {subject.code: subject for subject in db.query(Subject).all()}
    for subject_id, name, code, icon, description in SUBJECTS:
        if code not in subjects_by_code:
            subject = Subject(
                id=subject_id,
                name=name,
                code=code,
                icon=icon,
                description=description,
            )
            db.add(subject)
            subjects_by_code[code] = subject
    db.flush()

    next_question_id = 200001
    for pack in PACKS:
        subject = subjects_by_code[pack["code"]]
        exam = db.query(Exam).filter(Exam.id == pack["id"]).first()
        if not exam:
            exam = Exam(
                id=pack["id"],
                title=pack["title"],
                subject_id=subject.id,
                duration_minutes=pack["minutes"],
                total_questions=len(pack["questions"]),
                description=f"{pack['lesson']} · {len(pack['questions'])} câu hỏi trắc nghiệm có lời giải.",
                is_active=True,
            )
            db.add(exam)
            db.flush()

        for order, (content, options, answer_index, explanation) in enumerate(pack["questions"], start=1):
            question_id = next_question_id
            next_question_id += 1
            question_row = db.query(Question).filter(Question.id == question_id).first()
            if not question_row:
                question_row = Question(
                    id=question_id,
                    subject_id=subject.id,
                    content=content,
                    option_a=options[0],
                    option_b=options[1],
                    option_c=options[2],
                    option_d=options[3],
                    correct_option="ABCD"[answer_index],
                    difficulty=1 if order <= 4 else 2,
                    chapter=pack["topic"],
                    topic=pack["topic"],
                    lesson=pack["lesson"],
                    grade=pack["grade"],
                    raw_explanation=explanation,
                    tags=f"seed, {pack['code']}, grade-{pack['grade']}",
                )
                db.add(question_row)
                db.flush()

            link = db.query(ExamQuestion).filter(
                ExamQuestion.exam_id ==exam.id,
                ExamQuestion.question_id == question_row.id,
            ).first()
            if not link:
                db.add(ExamQuestion(
                    exam_id=exam.id,
                    question_id=question_row.id,
                    question_order=order,
                ))
        exam.total_questions = len(pack["questions"])
    db.commit()
