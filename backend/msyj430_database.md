# msyj430 数据库记录（姓名：孟思颐佳 | 学号：24001010430）

> 本文件按执行顺序记录全部建表与测试数据 SQL，仅凭本文件即可在新机器上完整重建数据库。
> 数据库：MySQL 8.4，库名 `msyj430_ketangai`，字符集 utf8mb4。

## 步骤 1：创建数据库

```sql
CREATE DATABASE IF NOT EXISTS msyj430_ketangai
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;
```

## 步骤 2：创建科技新闻表（msyj430_news）

```sql
USE msyj430_ketangai;

CREATE TABLE IF NOT EXISTS msyj430_news (
  msyj430_news_id          INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '新闻主键',
  msyj430_news_title       VARCHAR(120) NOT NULL COMMENT '新闻标题',
  msyj430_news_summary     VARCHAR(255) NOT NULL COMMENT '新闻摘要',
  msyj430_news_content     TEXT         NOT NULL COMMENT '新闻正文',
  msyj430_news_source      VARCHAR(60)  NOT NULL COMMENT '来源媒体',
  msyj430_news_author      VARCHAR(40)  NOT NULL COMMENT '作者',
  msyj430_news_category    VARCHAR(30)  NOT NULL COMMENT '新闻分类',
  msyj430_news_publish_time DATETIME    NOT NULL COMMENT '发布时间',
  msyj430_news_views       INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  PRIMARY KEY (msyj430_news_id),
  KEY idx_publish_time (msyj430_news_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='科技新闻表';
```

## 步骤 3：插入科技新闻测试数据（8 条）

```sql
INSERT INTO msyj430_news
  (msyj430_news_title, msyj430_news_summary, msyj430_news_content, msyj430_news_source, msyj430_news_author, msyj430_news_category, msyj430_news_publish_time, msyj430_news_views)
VALUES
  ('国产多模态大模型发布 2.0 版本，端侧推理时延降至 120 毫秒',
   '新一代模型在同等算力下视觉与语音理解精度提升 18%，可在手机端离线运行。',
   '该模型采用稀疏专家混合架构，参数量较上一代缩减 30%，但多模态对齐效果反而更好。实测在骁龙 8 系平台上，单帧图像理解时延从 210 毫秒降至 120 毫秒。团队同时开放了端侧推理工具链，开发者可将模型裁剪后直接嵌入移动应用，无需联网即可完成图文问答。',
   '智算前沿', '林知远', '人工智能', '2026-11-18 09:20:00', 1286),
  ('8.4 英寸折叠屏手机实现量产，铰链通过 50 万次弯折测试',
   '新一代水滴铰链采用液态金属加碳纤维骨架，整机厚度控制在 9.2 毫米。',
   '产线消息显示，该机型的内屏折痕深度比上一代降低 42%，在实验室完成 50 万次开合测试后屏幕仍无亮点。厂商表示首月备货量约为 12 万台，主要面向商务与影像创作人群，配套的手写笔支持 4096 级压感。',
   '消费电子观察', '苏若楠', '消费电子', '2026-11-17 15:05:00', 964),
  ('国内首个 5G-A 通感一体基站完成规模商用验证',
   '单站可同时完成通信与低空目标探测，探测距离达到 3 公里。',
   '验证选取了港口与物流园区两类场景，基站在提供 5G-A 大上行带宽的同时，通过对电磁回波的解析识别无人机与船舶位置，定位误差小于 1.5 米。运营商称后续将在 20 个城市的核心区域规模部署，为低空飞行器提供连续覆盖的感知底座。',
   '通信产业网', '周允之', '通信技术', '2026-11-16 10:40:00', 1522),
  ('人形机器人进驻汽车总装车间，连续作业时长突破 2000 小时',
   '双足机器人在总装线承担内饰件搬运，单班次节拍稳定在 42 秒。',
   '项目负责人介绍，机器人通过视觉伺服完成螺栓对位，配合自研的力控关节将装配误差控制在 0.3 毫米内。经过 2000 小时连续运行，关节模组的回差漂移小于 0.02 度，日常维护只需每周一次的润滑补给。',
   '智能制造周刊', '孟繁舟', '机器人', '2026-11-15 08:55:00', 1877),
  ('128 比特超导量子计算机完成新一代纠错实验',
   '研究团队将逻辑比特错误率压低至 10 的负六次方量级。',
   '实验采用表面码方案，在 128 个物理比特上构建了 16 个逻辑比特，通过实时反馈解码把单次门操作误差降低一个数量级。论文同时公开了低温布线方案，为后续扩展到 500 比特规模提供了可复用的工程路径。',
   '量子科学研究', '顾承宇', '量子计算', '2026-11-14 14:30:00', 1103),
  ('低空经济加速落地，无人机配送网络已覆盖 12 个城市',
   '日均配送单量突破 3 万单，平均送达时间缩短至 18 分钟。',
   '配送航线以社区驿站为节点，采用分布式起降柜完成自动换电，单架次续航覆盖 12 公里。运营方表示，通过与空管部门共建的低空航路管理系统，全部航线实现了秒级冲突预警，年内计划将覆盖城市扩展到 30 个。',
   '低空经济参考', '柳文琪', '低空经济', '2026-11-13 11:10:00', 2015),
  ('半固态电池完成装车路测，能量密度达到 400 Wh/kg',
   '整车 CLTC 续航提升至 1080 公里，-20℃ 容量保持率超过 88%。',
   '测试车队在黑龙江与海南两地完成高低温循环，累计行驶 6.8 万公里后电池包容量衰减 3.1%。电解质采用复合凝胶体系，针刺实验中未出现起火，量产版本计划于明年二季度随中大型轿车一同交付。',
   '新能源车评', '韩子墨', '新能源', '2026-11-12 16:45:00', 1693),
  ('开源智能座舱操作系统发布，支持双语音助手并行响应',
   '系统基于微内核架构，应用冷启动时间缩短 35%，已适配 6 款车机芯片。',
   '该系统的核心是把座舱域控拆分为安全岛与娱乐域两个独立分区，导航、空调等关键功能运行在安全岛上，不受娱乐应用崩溃影响。双语音助手可分别处理驾驶位与副驾指令，实测并行唤醒时互不串音。',
   '车联网技术', '叶清和', '智能汽车', '2026-11-11 09:00:00', 1438);
```

## 步骤 4：创建图文列表表（msyj430_gallery）

```sql
CREATE TABLE IF NOT EXISTS msyj430_gallery (
  msyj430_gallery_id          INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '图文主键',
  msyj430_gallery_title       VARCHAR(120) NOT NULL COMMENT '图文标题',
  msyj430_gallery_description VARCHAR(255) NOT NULL COMMENT '图文简介',
  msyj430_gallery_image       VARCHAR(200) NOT NULL COMMENT '图片相对路径',
  msyj430_gallery_category    VARCHAR(30)  NOT NULL COMMENT '所属分类',
  msyj430_gallery_source      VARCHAR(60)  NOT NULL COMMENT '图片来源',
  msyj430_gallery_publish_time DATETIME    NOT NULL COMMENT '发布时间',
  msyj430_gallery_views       INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '浏览量',
  PRIMARY KEY (msyj430_gallery_id),
  KEY idx_gallery_time (msyj430_gallery_publish_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='图文列表表';
```

## 步骤 5：插入图文列表测试数据（8 条）

```sql
INSERT INTO msyj430_gallery
  (msyj430_gallery_title, msyj430_gallery_description, msyj430_gallery_image, msyj430_gallery_category, msyj430_gallery_source, msyj430_gallery_publish_time, msyj430_gallery_views)
VALUES
  ('智能座舱多屏交互方案', '中控、仪表与副驾三屏联动，导航信息可一键推送至任意屏。', 'images/gallery-01.jpg', '智能汽车', '课堂实拍素材', '2026-11-18 10:12:00', 862),
  ('人形机器人关节模组', '一体化力控关节，集成谐波减速器与双编码器反馈。', 'images/gallery-02.jpg', '机器人', '课堂实拍素材', '2026-11-17 14:26:00', 741),
  ('超导量子计算芯片', '128 比特超导处理器，采用倒装焊封装与低温布线。', 'images/gallery-03.jpg', '量子计算', '课堂实拍素材', '2026-11-16 09:48:00', 593),
  ('三折叠屏手机铰链结构', '双水滴铰链配合碳纤维骨架，展开厚度仅 3.6 毫米。', 'images/gallery-04.jpg', '消费电子', '课堂实拍素材', '2026-11-15 16:02:00', 1084),
  ('城市低空物流无人机', '六旋翼机身配自动换电起降柜，单架次覆盖 12 公里。', 'images/gallery-05.jpg', '低空经济', '课堂实拍素材', '2026-11-14 11:35:00', 917),
  ('半固态动力电池包', '凝胶电解质电芯成组方案，能量密度 400 Wh/kg。', 'images/gallery-06.jpg', '新能源', '课堂实拍素材', '2026-11-13 15:20:00', 655),
  ('5G-A 通感一体基站', '通信与雷达感知共口径天线，可同时探测低空目标。', 'images/gallery-07.jpg', '通信技术', '课堂实拍素材', '2026-11-12 08:40:00', 1203),
  ('端侧 AI 推理芯片', '面向移动端的低功耗 NPU，支持多模态模型离线推理。', 'images/gallery-08.jpg', '芯片', '课堂实拍素材', '2026-11-11 13:14:00', 986);
```


## 步骤 6：知识库相关表（RAG）

知识库功能新增三张表，均在 `msyj430_ketangai` 库内，字符集 utf8mb4。

```sql
USE msyj430_ketangai;

CREATE TABLE IF NOT EXISTS msyj430_kb (
  msyj430_kb_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '知识库主键',
  msyj430_kb_name VARCHAR(100) NOT NULL COMMENT '知识库名称',
  msyj430_kb_desc VARCHAR(255) DEFAULT '' COMMENT '知识库说明',
  msyj430_kb_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库';

CREATE TABLE IF NOT EXISTS msyj430_kb_file (
  msyj430_kb_file_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '文件主键',
  msyj430_kb_id INT UNSIGNED NOT NULL COMMENT '所属知识库',
  msyj430_kb_file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  msyj430_kb_file_ext VARCHAR(20) NOT NULL DEFAULT '' COMMENT '扩展名',
  msyj430_kb_file_size INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字节数',
  msyj430_kb_file_chars INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '解析出的字符数',
  msyj430_kb_file_chunks INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片数量',
  msyj430_kb_file_path VARCHAR(255) NOT NULL DEFAULT '' COMMENT '落盘路径',
  msyj430_kb_file_status VARCHAR(20) NOT NULL DEFAULT 'ready' COMMENT '解析状态 ready/failed',
  msyj430_kb_file_error VARCHAR(255) NOT NULL DEFAULT '' COMMENT '失败原因',
  msyj430_kb_file_upload_time DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '上传时间',
  PRIMARY KEY (msyj430_kb_file_id),
  KEY idx_msyj430_kb_id (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库文件';

CREATE TABLE IF NOT EXISTS msyj430_kb_chunk (
  msyj430_kb_chunk_id INT UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '切片主键',
  msyj430_kb_id INT UNSIGNED NOT NULL COMMENT '所属知识库',
  msyj430_kb_file_id INT UNSIGNED NOT NULL COMMENT '所属文件',
  msyj430_kb_chunk_index INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '切片序号',
  msyj430_kb_chunk_content TEXT NOT NULL COMMENT '切片正文',
  msyj430_kb_chunk_embedding MEDIUMTEXT COMMENT '向量（JSON 数组，可为空）',
  msyj430_kb_chunk_chars INT UNSIGNED NOT NULL DEFAULT 0 COMMENT '字符数',
  PRIMARY KEY (msyj430_kb_chunk_id),
  KEY idx_msyj430_chunk_kb (msyj430_kb_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='知识库切片';
```

说明：
- 向量以 JSON 数组字符串存入 `msyj430_kb_chunk_embedding`（bge-m3 输出 1024 维），检索时在内存中计算余弦相似度，无需安装向量数据库插件。
- 删除知识库时级联删除文件与切片；删除文件时连带删除其切片。
- 上传的原始文件落盘在 `backend/uploads/`，已在 `.gitignore` 中忽略。
- 修改时间：2026-11-23 14:10
