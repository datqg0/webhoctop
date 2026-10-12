export const MOCK_SUBJECTS = [
  { id: "sub-toan", name: "Toán học", code: "toan", icon: "Calculator", description: "Khảo sát hàm số, Oxyz, Tích phân" },
  { id: "sub-ly", name: "Vật lý", code: "ly", icon: "Atom", description: "Dao động cơ, Sóng cơ, Điện xoay chiều" },
  { id: "sub-hoa", name: "Hóa học", code: "hoa", icon: "FlaskConical", description: "Este - Lipit, Cacbohidrat, Polime" },
  { id: "sub-sinh", name: "Sinh học", code: "sinh", icon: "Dna", description: "Quy luật di truyền, Tiến hóa" },
  { id: "sub-anh", name: "Tiếng Anh", code: "anh", icon: "Languages", description: "Ngữ pháp, Đọc hiểu THPTQG" },
  { id: "sub-tin", name: "Tin học", code: "tin", icon: "Code2", description: "Lập trình, dữ liệu và kỹ năng số" },
];

export const MOCK_EXAMS = [
  {
    id: "exam-toan-01",
    title: "Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Chuyên Đề Hàm Số & Khảo Sát)",
    subject_id: "sub-toan",
    subject_name: "Toán học",
    subject_code: "toan",
    duration_minutes: 45,
    total_questions: 4,
    description: "Đề thi rèn luyện kỹ năng nhận biết bảng biến thiên, cực trị, tiệm cận và giá trị lớn nhất nhỏ nhất chuẩn format Moon.vn.",
    created_at: new Date().toISOString()
  },
  {
    id: "exam-ly-01",
    title: "Đề Thi Thử Vật Lý 12 - Chuyên Đề Dao Động Điều Hòa & Sóng Cơ",
    subject_id: "sub-ly",
    subject_name: "Vật lý",
    subject_code: "ly",
    duration_minutes: 30,
    total_questions: 2,
    description: "Bộ câu hỏi trắc nghiệm rèn phản xạ nhanh về dao động điều hòa và con lắc đơn.",
    created_at: new Date().toISOString()
  }
];

export const MOCK_EXAM_DETAILS = {
  "exam-toan-01": {
    id: "exam-toan-01",
    title: "Đề Thi Thử Tốt Nghiệp THPT 2026 - Môn Toán (Chuyên Đề Hàm Số & Khảo Sát)",
    subject_name: "Toán học",
    duration_minutes: 45,
    total_questions: 4,
    questions: [
      {
        id: 1001,
        order: 1,
        content: "Cho hàm số $y = f(x)$ có bảng xét dấu đạo hàm: $f'(x) > 0$ trên $(-\\infty; 1)$ và $(3; +\\infty)$, $f'(x) < 0$ trên $(1; 3)$. Mệnh đề nào dưới đây đúng?",
        option_a: "Hàm số nghịch biến trên khoảng $(-\\infty; 1)$.",
        option_b: "Hàm số đồng biến trên khoảng $(1; 3)$.",
        option_c: "Hàm số đạt cực đại tại điểm $x = 1$.",
        option_d: "Hàm số đạt cực tiểu tại điểm $x = 1$.",
        difficulty: 2,
        chapter: "Cực trị của hàm số"
      },
      {
        id: 1002,
        order: 2,
        content: "Đồ thị hàm số $y = \\frac{2x - 1}{x + 1}$ có đường tiệm cận đứng là đường thẳng nào sau đây?",
        option_a: "$x = 2$",
        option_b: "$x = -1$",
        option_c: "$y = 2$",
        option_d: "$y = -1$",
        difficulty: 1,
        chapter: "Tiệm cận đồ thị hàm số"
      },
      {
        id: 1003,
        order: 3,
        content: "Giá trị lớn nhất của hàm số $f(x) = x^3 - 3x + 2$ trên đoạn $[0; 2]$ bằng bao nhiêu?",
        option_a: "2",
        option_b: "4",
        option_c: "0",
        option_d: "6",
        difficulty: 2,
        chapter: "Giá trị lớn nhất, nhỏ nhất"
      },
      {
        id: 1004,
        order: 4,
        content: "Trong không gian $Oxyz$, cho mặt phẳng $(P): 2x - y + 3z - 5 = 0$. Một vectơ pháp tuyến của $(P)$ là:",
        option_a: "$\\vec{n}_1 = (2; -1; 3)$",
        option_b: "$\\vec{n}_2 = (2; 1; 3)$",
        option_c: "$\\vec{n}_3 = (-2; -1; 3)$",
        option_d: "$\\vec{n}_4 = (2; -1; -5)$",
        difficulty: 1,
        chapter: "Phương trình mặt phẳng Oxyz"
      }
    ]
  }
};
